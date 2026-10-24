
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageTitle from "../_components/page-title";
import RefreshBtn from "../_components/refresh-btn";
import ProjectTable from "./_components/project-table";

const Projects = async () => {
  return (
    <div>
      <PageTitle title="Projects">
        <div className="flex gap-2">
          <RefreshBtn />
          <Button size={"sm"}>
            <Link href={"/admin/projects/new"}>Add New Project</Link>
          </Button>
        </div>
      </PageTitle>
      <ProjectTable />
    </div>
  );
};

export default Projects;
