import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container, Flex } from '../ui/Layout';
import { Text } from '../ui/Typography';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPrevious,
  onNext,
}) => {
  const startItem = Math.min((currentPage - 1) * limit + 1, total);
  const endItem = Math.min(currentPage * limit, total);

  return (
    <Container className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200">
      <Flex direction="col" gap="sm" className="sm:flex-row sm:items-center sm:justify-between">
        <Container className="text-center sm:text-left">
          <Text variant="body" className="text-xs sm:text-sm font-medium text-gray-700">
            <Text className="block xs:inline">
              Showing{" "}
              <Text className="font-bold text-primary-600">{startItem}</Text>{" "}
              to{" "}
              <Text className="font-bold text-primary-600">{endItem}</Text>
            </Text>
            <Text className="block xs:inline">
              {" "}of <Text className="font-bold text-primary-600">{total}</Text> results
            </Text>
          </Text>
        </Container>
        
        <Flex align="center" justify="center" gap="sm">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={currentPage === 1}
            icon={ChevronLeft}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm"
          >
            <Text className="hidden xs:inline text-xs sm:text-sm">Previous</Text>
          </Button>
          
          <Container className="px-2 sm:px-4 py-2 bg-white rounded-lg border border-gray-300">
            <Text variant="body" className="text-xs sm:text-sm font-bold text-gray-700 whitespace-nowrap">
              <Text className="hidden xs:inline">Page </Text>{currentPage}<Text className="hidden xs:inline"> of {totalPages}</Text>
            </Text>
          </Container>
          
          <Button
            variant="secondary"
            onClick={onNext}
            disabled={currentPage === totalPages}
            icon={ChevronRight}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm"
          >
            <Text className="hidden xs:inline text-xs sm:text-sm">Next</Text>
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
};