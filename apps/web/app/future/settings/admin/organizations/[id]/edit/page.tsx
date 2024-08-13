import { type Params } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { redirect } from "next/navigation";
import { z } from "zod";

import LicenseRequired from "@calcom/features/ee/common/components/LicenseRequired";
import { OrgForm } from "@calcom/features/ee/organizations/pages/settings/admin/AdminOrgEditPage";
import { OrganizationRepository } from "@calcom/lib/server/repository/organization";
import prisma from "@calcom/prisma";

const orgIdSchema = z.object({ id: z.coerce.number() });

export const generateMetadata = async ({ params }: { params: Params }) => {
  const input = orgIdSchema.safeParse(params);
  if (!input.success) {
    return await _generateMetadata(
      () => "",
      () => "Here you can edit an organization."
    );
  }

  const teamName = await prisma.team.findFirst({
    where: {
      id: input.data.id,
    },
    select: {
      name: true,
    },
  });

  return await _generateMetadata(
    () => `Editing organization: ${teamName?.name}`,
    () => "Here you can edit an organization."
  );
};

const Page = async ({ params }: { params: Params }) => {
  const input = orgIdSchema.safeParse(params);

  if (!input.success) redirect("/404");

  try {
    const org = await OrganizationRepository.adminFindById({ id: input.data.id });
    return (
      <LicenseRequired>
        <OrgForm org={org} />
      </LicenseRequired>
    );
  } catch {
    redirect("/404");
  }
};

export default Page;
