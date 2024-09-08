import { FaClipboardList } from "react-icons/fa6";
import { FaGlobe } from "react-icons/fa6";
import { FaFileExport } from "react-icons/fa6";

import StepperItem from "./StepperItem";

const Stepper = ({ view, title }: any) => {
  return (
    <nav className="w-[250px] min-h-[93vh] px-3 py-8 border-r border-gray-200 flex-shrink-0">
      <h1 className="text-sm text-gray-400 uppercase">{title}</h1>
      <ul className="my-4">
        <StepperItem label="Discovery Requests" active={view === "data"}>
          <FaGlobe className="" />
        </StepperItem>
        <li className="h-16 w-[1px] border-l border-gray-100 mx-6"></li>
        <StepperItem label="Review Violations" active={view === "review"}>
          <FaClipboardList className="" />
        </StepperItem>
        <li className="h-16 w-[1px] border-l border-gray-100 mx-6"></li>
        <StepperItem label="Generate Motion" active={view === "export"}>
          <FaFileExport className="" />
        </StepperItem>
      </ul>
    </nav>
  );
};

export default Stepper;
