/**
 * toast.js — maps the `sonner` API the ported pages call to `react-hot-toast`,
 * which this app already ships and already mounts a <Toaster /> for.
 *
 * sonner's second argument is an options object whose `description` we fold
 * into the message, since react-hot-toast renders a single line.
 */
import hot from "react-hot-toast";

const withDescription = (message, opts) =>
  opts?.description ? `${message} — ${opts.description}` : message;

export const toast = Object.assign(
  (message, opts) => hot(withDescription(message, opts)),
  {
    success: (message, opts) => hot.success(withDescription(message, opts)),
    error: (message, opts) => hot.error(withDescription(message, opts)),
    info: (message, opts) => hot(withDescription(message, opts)),
    warning: (message, opts) => hot(withDescription(message, opts)),
    message: (message, opts) => hot(withDescription(message, opts)),
    loading: (message, opts) => hot.loading(withDescription(message, opts)),
    dismiss: (id) => hot.dismiss(id),
    promise: (promise, msgs) => hot.promise(promise, msgs),
  },
);

export default toast;
