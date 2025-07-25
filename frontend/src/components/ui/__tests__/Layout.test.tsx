import { render, screen } from '../../../test-utils';
import { Container, Flex, Grid, Stack } from '../Layout';

describe('Layout Components', () => {
  describe('Container', () => {
    it('renders children', () => {
      render(<Container>Test content</Container>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Container className="custom-class">Content</Container>);
      expect(screen.getByText('Content')).toHaveClass('custom-class');
    });
  });

  describe('Flex', () => {
    it('renders with default flex classes', () => {
      render(<Flex>Flex content</Flex>);
      const element = screen.getByText('Flex content');
      expect(element).toHaveClass('flex', 'flex-row', 'items-start', 'justify-start');
    });

    it('applies direction classes', () => {
      render(<Flex direction="col">Content</Flex>);
      expect(screen.getByText('Content')).toHaveClass('flex-col');
    });

    it('applies align classes', () => {
      render(<Flex align="center">Content</Flex>);
      expect(screen.getByText('Content')).toHaveClass('items-center');
    });

    it('applies justify classes', () => {
      render(<Flex justify="between">Content</Flex>);
      expect(screen.getByText('Content')).toHaveClass('justify-between');
    });

    it('applies gap classes', () => {
      render(<Flex gap="md">Content</Flex>);
      expect(screen.getByText('Content')).toHaveClass('gap-2');
    });

    it('applies wrap class when enabled', () => {
      render(<Flex wrap>Content</Flex>);
      expect(screen.getByText('Content')).toHaveClass('flex-wrap');
    });
  });

  describe('Grid', () => {
    it('renders with default grid classes', () => {
      render(<Grid>Grid content</Grid>);
      const element = screen.getByText('Grid content');
      expect(element).toHaveClass('grid', 'grid-cols-1');
    });

    it('applies column classes', () => {
      render(<Grid cols={3}>Content</Grid>);
      expect(screen.getByText('Content')).toHaveClass('grid-cols-3');
    });

    it('applies gap classes', () => {
      render(<Grid gap="lg">Content</Grid>);
      expect(screen.getByText('Content')).toHaveClass('gap-3');
    });
  });

  describe('Stack', () => {
    it('renders with default spacing', () => {
      render(<Stack>Stack content</Stack>);
      expect(screen.getByText('Stack content')).toHaveClass('space-y-2');
    });

    it('applies custom spacing classes', () => {
      render(<Stack spacing="xl">Content</Stack>);
      expect(screen.getByText('Content')).toHaveClass('space-y-4');
    });

    it('applies no spacing when spacing is none', () => {
      render(<Stack spacing="none">Content</Stack>);
      expect(screen.getByText('Content')).toHaveClass('space-y-0');
    });
  });
});