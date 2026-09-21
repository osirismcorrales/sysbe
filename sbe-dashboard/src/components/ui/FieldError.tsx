export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 font-medium text-[10px]">{message}</p>;
}
