
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getPageNumbers } from "./userTableUtils";

interface UserTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function UserTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize
}: UserTablePaginationProps) {
  // Calculate start and end item for the current page
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  // Get the array of page numbers to display
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {totalItems > 0 ? startItem : 0} a {endItem} de {totalItems} usuarios
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink 
              onClick={() => onPageChange(1)} 
              className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            >
              <ChevronsLeft className="h-4 w-4 mr-1" />
              Inicio
            </PaginationLink>
          </PaginationItem>
          
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)} 
              className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, i) => (
            page === null ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page as number)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)} 
              className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            />
          </PaginationItem>
          
          <PaginationItem>
            <PaginationLink 
              onClick={() => onPageChange(totalPages)} 
              className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            >
              Final
              <ChevronsRight className="h-4 w-4 ml-1" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
