import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Container, Flex } from "../ui/Layout";
import { Text } from "../ui/Typography";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = React.memo(({
  currentPage,
  totalPages,
  total,
  limit,
  onPrevious,
  onNext,
}) => {
  const { startItem, endItem } = React.useMemo(() => ({
    startItem: Math.min((currentPage - 1) * limit + 1, total),
    endItem: Math.min(currentPage * limit, total),
  }), [currentPage, limit, total]);

  return (
    <Container className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200">
      <Flex
        direction="col"
        gap="sm"
        align="center"
        className="sm:flex-row sm:items-center sm:justify-between"
        role="navigation"
        aria-label="Pagination Navigation"
      >
        <Container className="text-center sm:text-left">
          <Text
            variant="body"
            className="text-xs sm:text-sm font-medium text-gray-700"
          >
            <span className="block xs:inline">
              Showing{" "}
              <span className="font-bold text-primary-600">{startItem}</span> to{" "}
              <span className="font-bold text-primary-600">{endItem}</span>
            </span>
            <span className="block xs:inline">
              {" "}
              of <span className="font-bold text-primary-600">
                {total}
              </span>{" "}
              results
            </span>
          </Text>
        </Container>

        <Flex align="center" justify="center" gap="sm">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={currentPage === 1}
            icon={ChevronLeft}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm"
            aria-label={`Go to previous page, page ${currentPage - 1}`}
          >
            <Text className="hidden xs:inline text-xs sm:text-sm">
              Previous
            </Text>
          </Button>

          <Container 
            className="px-2 sm:px-4 py-2 bg-white rounded-lg border border-gray-300"
            role="status"
            aria-live="polite"
            aria-label={`Current page ${currentPage} of ${totalPages}`}
          >
            <Text
              variant="body"
              className="text-xs sm:text-sm font-bold text-gray-700 whitespace-nowrap"
            >
              <span className="hidden xs:inline">Page </span>
              {currentPage}
              <span className="hidden xs:inline"> of {totalPages}</span>
            </Text>
          </Container>

          <Button
            variant="secondary"
            onClick={onNext}
            disabled={currentPage === totalPages}
            icon={ChevronRight}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm"
            aria-label={`Go to next page, page ${currentPage + 1}`}
          >
            <Text className="hidden xs:inline text-xs sm:text-sm">Next</Text>
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
});
