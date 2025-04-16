
import { Layout } from "@/components/layout/Layout";
import { UserRole } from "@/types";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { userService } from "@/services/userService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function UsersAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const result = await userService.getUsers({
        page: currentPage,
        pageSize,
        searchTerm,
        roleFilter,
      });
      
      setUsers(result.users);
      setTotalItems(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, roleFilter]);

  // Function to refresh data after CRUD operations
  const refreshUsers = () => {
    fetchUsers();
  };

  return (
    <Layout 
      requireAuth={true} 
      allowedRoles={[UserRole.ADMIN]} 
      requiredPermissions={['user:read']}
    >
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
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <UsersTable 
                users={users} 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onRefresh={refreshUsers}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
