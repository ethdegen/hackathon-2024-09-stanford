import clsx from "clsx";

const StepperItem = ({ children, label, active }: any) => {
  const cx = clsx({
    "h-12 w-12 bg-gray-100 text-xl rounded-full flex justify-center items-center":
      true,
    "text-gray-300": !active,
    "text-default": active,
  });

  return (
    <li className="flex gap-2 items-center">
      <div className={cx}>{children}</div>
      <span className={active ? "text-default" : "text-gray-300"}>{label}</span>
    </li>
  );
};

export default StepperItem;
