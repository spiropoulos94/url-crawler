import React from "react";
import { Plus } from "lucide-react";
import { useAddURLForm } from "../hooks/useAddURLForm";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Alert } from "./ui/Alert";
import { Heading, Text } from "./ui/Typography";
import { Flex, Stack } from "./ui/Layout";
import { Icon, IconContainer } from "./ui/Icon";

export const AddURL: React.FC = React.memo(() => {
  const {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    setFieldValue,
    handleSubmit,
  } = useAddURLForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <Heading level={2}>
          <Flex align="center" gap="sm">
            <IconContainer bg="green" size="sm">
              <Icon icon={Plus} size="sm" className="text-green-600" />
            </IconContainer>
            Add New URL
          </Flex>
        </Heading>
        <Text variant="body" className="mt-1">
          Enter a website URL to start crawling and analyzing its content
        </Text>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit}>
          <Stack spacing="md">
            <Flex direction="col" gap="sm" className="sm:flex-row sm:gap-3">
              <Flex className="flex-1 w-full">
                <Input
                  type="text"
                  placeholder="https://example.com or example.com"
                  value={formData.url}
                  onChange={(e) => setFieldValue("url", e.target.value)}
                  error={errors.url}
                  disabled={isSubmitting}
                  className="text-base sm:text-lg "
                />
              </Flex>
              <Button
                type="submit"
                variant="success"
                disabled={isSubmitting || !formData.url.trim()}
                isLoading={isSubmitting}
                icon={Plus}
                className="min-w-[120px] sm:min-w-[140px] px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                Add URL
              </Button>
            </Flex>

            {isSuccess && (
              <Alert
                type="success"
                message="URL added successfully! It will be crawled shortly."
              />
            )}
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
});
