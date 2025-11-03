import { IconButton } from '~/components/ui/IconButton';
import { openMarketing } from '~/lib/stores/marketing';
import WithTooltip from '~/components/ui/Tooltip';

interface MarketingButtonProps {
  disabled?: boolean;
}

export function MarketingButton({ disabled = false }: MarketingButtonProps) {
  return (
    <WithTooltip tooltip="Get AI Marketing Strategies">
      <IconButton
        disabled={disabled}
        onClick={() => openMarketing()}
        title="Marketing"
        className="transition-all"
      >
        <div className="i-ph:megaphone-simple text-xl" />
      </IconButton>
    </WithTooltip>
  );
}
