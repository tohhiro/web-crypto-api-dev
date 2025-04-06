import { type FC } from "react";
import { Form } from "./components/Form";

const Home: FC = () => {
  return (
    <main>
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold">Hello World</h1>
          <Form />
        </div>
      </div>
    </main>
  );
};

export default Home;
