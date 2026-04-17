import { SignIn } from "@clerk/nextjs";

export default function SignInPage(){
  return(
    <div style={styles.container}>
      <SignIn/>
    </div>
  )
}

const styles = {
  container:{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#f0f7f4'
  }
}