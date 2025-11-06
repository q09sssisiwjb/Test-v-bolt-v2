import { IconButton } from '~/components/ui/IconButton';
import { setPendingInput } from '~/lib/stores/chat';
import WithTooltip from '~/components/ui/Tooltip';

interface MarketingButtonProps {
  disabled?: boolean;
}

export function MarketingButton({ disabled = false }: MarketingButtonProps) {
  const handleClick = () => {
    setPendingInput('Please analyze my app/website and provide a comprehensive marketing strategy.');
  };

  return (
    <WithTooltip tooltip="Get AI Marketing Strategies">
      <IconButton
        disabled={disabled}
        onClick={handleClick}
        title="Marketing"
        className="transition-all"
      >
        <div className="i-ph:megaphone-simple text-xl" />
      </IconButton>
    </WithTooltip>
  );
}
