
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
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
            />
            
            <UsersTable users={filteredUsers} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
