import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { ITerminal } from '~/types/terminal';
import { withResolvers } from './promises';
import { atom } from 'nanostores';

const COMMAND_TIMEOUT_MS = 10 * 60 * 1000;
const STREAM_READ_TIMEOUT_MS = 2 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export async function newShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
  const args: string[] = [];

  // we spawn a JSH process with a fallback cols and rows in case the process is not attached yet to a visible terminal
  const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
    terminal: {
      cols: terminal.cols ?? 80,
      rows: terminal.rows ?? 15,
    },
  });

  const input = process.input.getWriter();
  const output = process.output;

  const jshReady = withResolvers<void>();

  let isInteractive = false;
  output.pipeTo(
    new WritableStream({
      write(data) {
        if (!isInteractive) {
          const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

          if (osc === 'interactive') {
            // wait until we see the interactive OSC
            isInteractive = true;

            jshReady.resolve();
          }
        }

        terminal.write(data);
      },
    }),
  );

  terminal.onData((data) => {
    // console.log('terminal onData', { data, isInteractive });

    if (isInteractive) {
      input.write(data);
    }
  });

  await jshReady.promise;

  return process;
}

export type ExecutionResult = { output: string; exitCode: number } | undefined;

export class BoltShell {
  #initialized: (() => void) | undefined;
  #readyPromise: Promise<void>;
  #webcontainer: WebContainer | undefined;
  #terminal: ITerminal | undefined;
  #process: WebContainerProcess | undefined;
  executionState = atom<{ sessionId: string; active: boolean; executionPrms?: Promise<any> } | undefined>();
  #outputStream: ReadableStreamDefaultReader<string> | undefined;
  #shellInputStream: WritableStreamDefaultWriter<string> | undefined;

  constructor() {
    this.#readyPromise = new Promise((resolve) => {
      this.#initialized = resolve;
    });
  }

  ready() {
    return this.#readyPromise;
  }

  async init(webcontainer: WebContainer, terminal: ITerminal) {
    this.#webcontainer = webcontainer;
    this.#terminal = terminal;

    const { process, output } = await this.newBoltShellProcess(webcontainer, terminal);
    this.#process = process;
    this.#outputStream = output.getReader();
    await this.waitTillOscCode('interactive');
    this.#initialized?.();
  }

  get terminal() {
    return this.#terminal;
  }

  get process() {
    return this.#process;
  }

  async executeCommand(sessionId: string, command: string): Promise<ExecutionResult> {
    if (!this.process || !this.terminal) {
      return undefined;
    }

    const state = this.executionState.get();

    this.terminal.input('\x03');

    if (state && state.executionPrms) {
      try {
        await withTimeout(
          state.executionPrms,
          COMMAND_TIMEOUT_MS,
          'Previous command execution timed out'
        );
      } catch (error) {
        console.warn('Previous command timed out, continuing with new command', error);
      }
    }

    this.terminal.input(command.trim() + '\n');

    const executionPromise = withTimeout(
      this.getCurrentExecutionResult(),
      COMMAND_TIMEOUT_MS,
      `Command execution timed out after ${COMMAND_TIMEOUT_MS / 1000}s: ${command}`
    );
    
    this.executionState.set({ sessionId, active: true, executionPrms: executionPromise });

    try {
      const resp = await executionPromise;
      this.executionState.set({ sessionId, active: false });
      return resp;
    } catch (error) {
      this.executionState.set({ sessionId, active: false });
      console.error('Command execution failed:', error);
      throw error;
    }
  }

  async newBoltShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
    const args: string[] = [];

    // we spawn a JSH process with a fallback cols and rows in case the process is not attached yet to a visible terminal
    const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
      terminal: {
        cols: terminal.cols ?? 80,
        rows: terminal.rows ?? 15,
      },
    });

    const input = process.input.getWriter();
    this.#shellInputStream = input;

    const [internalOutput, terminalOutput] = process.output.tee();

    const jshReady = withResolvers<void>();

    let isInteractive = false;
    terminalOutput.pipeTo(
      new WritableStream({
        write(data) {
          if (!isInteractive) {
            const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

            if (osc === 'interactive') {
              // wait until we see the interactive OSC
              isInteractive = true;

              jshReady.resolve();
            }
          }

          terminal.write(data);
        },
      }),
    );

    terminal.onData((data) => {
      // console.log('terminal onData', { data, isInteractive });

      if (isInteractive) {
        input.write(data);
      }
    });

    await jshReady.promise;

    return { process, output: internalOutput };
  }

  async getCurrentExecutionResult(): Promise<ExecutionResult> {
    const { output, exitCode } = await this.waitTillOscCode('exit');
    return { output, exitCode };
  }

  async waitTillOscCode(waitCode: string) {
    let fullOutput = '';
    let exitCode: number = 0;

    if (!this.#outputStream) {
      return { output: fullOutput, exitCode };
    }

    const tappedStream = this.#outputStream;
    let lastReadTime = Date.now();

    while (true) {
      try {
        const readPromise = tappedStream.read();
        const { value, done } = await withTimeout(
          readPromise,
          STREAM_READ_TIMEOUT_MS,
          'Stream read timeout - browser may have throttled background tab'
        );

        lastReadTime = Date.now();

        if (done) {
          break;
        }

        const text = value || '';
        fullOutput += text;

        const [, osc, , , code] = text.match(/\x1b\]654;([^\x07=]+)=?((-?\d+):(\d+))?\x07/) || [];

        if (osc === 'exit') {
          exitCode = parseInt(code, 10);
        }

        if (osc === waitCode) {
          break;
        }
      } catch (error) {
        if (document.hidden) {
          console.warn('Tab is in background, stream read may be throttled. Consider keeping tab active during command execution.');
        }
        
        const timeSinceLastRead = Date.now() - lastReadTime;
        if (timeSinceLastRead > STREAM_READ_TIMEOUT_MS) {
          console.error('Stream read timed out, command may have hung');
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { output: fullOutput, exitCode };
  }
}

export function newBoltShellProcess() {
  return new BoltShell();
}
