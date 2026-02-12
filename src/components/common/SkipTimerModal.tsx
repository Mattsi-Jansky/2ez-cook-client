import { formatTime } from "../../utils";
import css from "./SkipTimerModal.module.css";

interface SkipTimerModalProps {
  timerLabel: string;
  timeLeft: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SkipTimerModal({ timerLabel, timeLeft, onConfirm, onCancel }: SkipTimerModalProps) {
  return (
    <div className={css.overlay}>
      <div className={css.modal}>
        <div className={css.emoji}>⏱️</div>
        <div className={css.title}>Timer still running</div>
        <div className={css.message}>
          <strong>{timerLabel}</strong> still has <strong>{formatTime(timeLeft)}</strong> remaining.
        </div>
        <div className={css.warning}>
          Skipping may mean things are under-cooked. Are you sure?
        </div>
        <div className={css.actions}>
          <button onClick={onCancel} className={css.cancelBtn}>
            Keep waiting
          </button>
          <button onClick={onConfirm} className={css.confirmBtn}>
            Skip anyway
          </button>
        </div>
      </div>
    </div>
  );
}
