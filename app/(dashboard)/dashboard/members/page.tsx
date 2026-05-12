import { Suspense } from "react";
import { getMembers, getRoles } from "@/app/lib/queries";
import MembersClient from "./MembersClient";
import MembersTableSkeleton from "./MembersTableSkeleton";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; roleId?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const roleId = params.roleId ?? "";
  const isActive = params.status === "inactive" ? false : params.status === "active" ? true : undefined;
  const page = Number(params.page ?? 1);

  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <Suspense fallback={<MembersTableSkeleton />}>
        <MembersContent
          search={search}
          roleId={roleId}
          isActive={isActive}
          page={page}
        />
      </Suspense>
    </main>
  );
}

async function MembersContent({
  search,
  roleId,
  isActive,
  page,
}: {
  search: string;
  roleId: string;
  isActive: boolean | undefined;
  page: number;
}) {
  const [{ members, total }, roles] = await Promise.all([
    getMembers({ search, roleId: roleId || undefined, isActive, page, perPage: 20 }),
    getRoles(),
  ]);

  return (
    <MembersClient
      initialMembers={members}
      total={total}
      roles={roles}
      initialSearch={search}
      initialRoleId={roleId}
      initialStatus={isActive === false ? "inactive" : isActive === true ? "active" : "all"}
      page={page}
    />
  );
}
