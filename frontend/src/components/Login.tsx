import React from "react";
import { Globe } from "lucide-react";
import { useAuthForm } from "../hooks/useAuthForm";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Alert } from "./ui/Alert";
import { Heading, Text } from "./ui/Typography";
import { Container, Flex, Stack } from "./ui/Layout";
import { Icon, IconContainer } from "./ui/Icon";

export const Login: React.FC = () => {
  const { 
    isRegisterMode, 
    formData, 
    error, 
    isLoading, 
    setFieldValue, 
    handleSubmit, 
    toggleMode 
  } = useAuthForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <Container className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md w-full">
        <Container className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <Container className="text-center mb-8">
            <Flex justify="center" className="mb-6">
              <IconContainer 
                variant="rounded" 
                bg="primary" 
                size="xl" 
                className="bg-gradient-to-r from-primary-500 to-blue-600 shadow-lg"
              >
                <Icon icon={Globe} size="xl" className="text-white" />
              </IconContainer>
            </Flex>
            <Heading 
              level={2} 
              className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent"
            >
              {isRegisterMode ? "Create Account" : "Welcome Back"}
            </Heading>
            <Text variant="subtitle" className="mt-3 font-medium">
              {isRegisterMode ? "Join Sykell Web Crawler" : "Sign in to continue"}
            </Text>
          </Container>

          <form onSubmit={onSubmit}>
            <Stack spacing="lg">
              <Stack spacing="md">
                <Input
                  label="Username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFieldValue("username", e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  className="py-4 text-lg bg-white/50 backdrop-blur-sm"
                />

                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFieldValue("password", e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="py-4 text-lg bg-white/50 backdrop-blur-sm"
                />
              </Stack>

              {error && (
                <Alert type="error" message={error} />
              )}

              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                fullWidth
                className="py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-lg"
              >
                {isRegisterMode ? "Create Account" : "Sign In"}
              </Button>

              <Container className="text-center pt-4">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200 cursor-pointer"
                  disabled={isLoading}
                >
                  {isRegisterMode
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Create one"}
                </button>
              </Container>
            </Stack>
          </form>
        </Container>
      </Container>
    </Container>
  );
};

export default Login;
