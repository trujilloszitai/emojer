import { Spinner } from ".";

const LoadingScreen = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size={64} />
    </div>
  );
};

export default LoadingScreen;