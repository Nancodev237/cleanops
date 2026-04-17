import { SignUp } from "@clerk/nextjs";

export default function SignUpPage(){
  return(
    <div style={styles.container}>
      <SignUp/>
    </div>
  )
}

const styles = {
  container:{
  display: flex,
  justifyContent: center,
  alignItems: center,
  height: 100,
  backgroundColor: '#f0f7f4'
  }
}