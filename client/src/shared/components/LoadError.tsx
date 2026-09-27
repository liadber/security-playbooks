import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';

type LoadErrorProps = {
  /** The page's heading, kept so the user still knows where they are. */
  title: string;
  message: string;
  onRetry: () => void;
};

/** The state of a page whose data failed to load: the heading, the reason and a Retry button. */
export function LoadError({ title, message, onRetry }: LoadErrorProps) {
  return (
    <>
      <h1>{title}</h1>
      <ErrorMessage>{message}</ErrorMessage>
      <Button variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </>
  );
}
