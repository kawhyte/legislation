import type { States } from "./JurisdictionSelector";

interface Props {
	jurisdiction: States | null;
}

const SectionHeader = ({ jurisdiction }: Props) => {
	if (!jurisdiction) {
		return (
			<div>
				<h2 className='text-2xl font-bold mb-4'>Legislature</h2>
			</div>
		);
	}

	return (
		<div>
			<h2 className='text-2xl font-bold mb-4'>
				{jurisdiction.name} Legislature
			</h2>
		</div>
	);
};

export default SectionHeader;
