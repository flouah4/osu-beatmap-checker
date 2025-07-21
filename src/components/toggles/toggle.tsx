export function Toggle({ isToggled, ...rest }) {
  return (
    <div
      className={`${
        isToggled && "justify-end bg-neo-green"
      } flex items-center ring-2 ring-inset rounded-full p-1 w-[48px] cursor-pointer`}
      {...rest}
    >
      <div className="size-4 rounded-full ring-2 ring-inset bg-background"></div>
    </div>
  );
}
