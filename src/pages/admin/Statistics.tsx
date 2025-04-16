
import { Layout } from "@/components/layout/Layout";
import { UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell,
  Legend 
} from "recharts";
import { mockService, mockUsers, mockCourses } from "@/lib/mock";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Statistics() {
  // Datos para el gráfico de usuarios por rol
  const usersByRole = Object.values(UserRole).map(role => {
    const count = mockUsers.filter(user => user.role === role).length;
    return { name: role, value: count };
  });

  // Datos simulados para tendencias de inscripción (últimos 6 meses)
  const enrollmentTrends = [
    { month: 'Noviembre', count: 5 },
    { month: 'Diciembre', count: 8 },
    { month: 'Enero', count: 12 },
    { month: 'Febrero', count: 15 },
    { month: 'Marzo', count: 20 },
    { month: 'Abril', count: 25 },
  ];

  // Datos simulados para categorías de cursos
  const courseCategories = [
    { name: 'Desarrollo', count: 4 },
    { name: 'Marketing', count: 3 },
    { name: 'Diseño', count: 2 },
    { name: 'Negocios', count: 5 },
    { name: 'Tecnología', count: 6 },
  ];

  const totalUsers = mockUsers.length;
  const totalCourses = mockCourses.length;
  const totalEnrollments = mockService.getTotalUserCount(); // Simulamos con el número de usuarios

  return (
    <Layout requireAuth={true} allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Estadísticas del Sistema</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Usuarios por Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer 
                  config={{
                    admin: { label: "Administrador", color: "#0088FE" },
                    teacher: { label: "Profesor", color: "#00C49F" },
                    user: { label: "Usuario", color: "#FFBB28" },
                  }}
                >
                  <PieChart>
                    <Pie
                      data={usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Inscripciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    count: { label: "Inscripciones", color: "#8884d8" },
                  }}
                >
                  <LineChart data={enrollmentTrends}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Cursos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  count: { label: "Número de Cursos", color: "#82ca9d" },
                }}
              >
                <BarChart data={courseCategories}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
