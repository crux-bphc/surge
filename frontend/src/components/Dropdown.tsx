import { useState } from "react";
import { useClickAway } from "@uidotdev/usehooks";
import { Link } from "@tanstack/react-router";

type DropdownProps = {
	options: string[];
	selectedValue?: string;
	placeholder: string;
	field: string;
};

function updateDropdown<T extends Record<string, string | undefined>>(
	prev: T,
	key: string,
	value: string | undefined
): T {
	if (value === undefined) {
		const { [key]: _, ...rest } = prev;
		return rest as T;
	}
	return { ...prev, [key]: value };
}

export default function Dropdown({
	options,
	selectedValue,
	placeholder,
	field,
}: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false);

	const ref = useClickAway<HTMLDivElement>(() => {
		setIsOpen(false);
	});

	const dropDownOptions = ["", ...options];

	return (
		<div ref={ref} className="relative flex w-full flex-col z-20">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="z-20 flex h-10 w-full cursor-pointer items-center justify-center rounded-3xl bg-[#25293E] text-sm hover:bg-[#25294F]"
			>
				{selectedValue || placeholder}
			</button>

			<div className="absolute top-10 flex w-full flex-col items-center justify-evenly text-xs z-25 mt-1">
				{dropDownOptions.map((option, index) => (
					<Link
						to="."
						key={option !== "" ? option : undefined}
						search={(prev) => updateDropdown(prev, field, option || undefined)}
						onClick={() => setIsOpen(false)}
						className="absolute top-0 flex rounded-sm h-8 w-full max-w-[10.5rem] shadow-3xl cursor-pointer items-center justify-center border border-y-1 border-x-0 border-[#1B1E30] bg-[#25293E] transition-all duration-200 ease-out hover:bg-[#25294F] md:w-42"
						style={{
							transform: isOpen
								? `translateY(${index * 2}rem)`
								: "translateY(-2.5rem)", // Hides the element
							opacity: isOpen ? 1 : 0,
							pointerEvents: isOpen ? "auto" : "none",
						}}
					>
						{option !== "" ? option : "N/A"}
					</Link>
				))}
			</div>
		</div>
	);
}
