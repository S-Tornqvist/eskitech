import React from "react";

function App() {
  return (
    <div>
      <h1>Hello from React!</h1>
      <MyComponent color="red"/>
    </div>
  );
}

type MyComponentProps = {
  color?: string;
};

function MyComponent(props: MyComponentProps) {
  return <p style={{color: props.color}}>Hello World</p>;
}

export default App;