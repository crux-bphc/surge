import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAllResources } from "../../utils/resourceLoader";
import ResourceCard from "../../components/ResourceCard";

export const Route = createFileRoute("/resource/")({
	loader: async () => await getAllResources(),
	component: RouteComponent,
});

function RouteComponent() {
	const loadedResources = useLoaderData({ from: "/resource/" });

	return (
		<div className="container m-auto max-w-7xl">
			<div className="border-b border-highlight-dark">
				<div className="text-3xl font-bold mb-6">
					<h1>
						Learn & <span className="text-accent-purple">More</span>
					</h1>
				</div>
			</div>
			<div className="text-2xl pt-8 w-full">
				<h2 className="pb-6">
					CRUx Bootstrap <span className="text-accent-purple">Modules</span>
				</h2>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full">
					{loadedResources.map((resource) => (
						<ResourceCard
							key={resource.slug}
							slug={resource.slug}
							title={resource.metadata.title}
							description={resource.metadata.description}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
