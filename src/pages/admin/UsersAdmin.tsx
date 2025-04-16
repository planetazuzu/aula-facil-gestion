
import { Layout } from "@/components/layout/Layout";
import { UserRole } from "@/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUsers } from "@/lib/mock/users";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";

export default function UsersAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calcula el total de páginas
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  
  // Obtiene los usuarios para la página actual
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Layout requireAuth={true} allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <UserFilters 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />
            
            <UsersTable 
              users={paginatedUsers} 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
