
async function verifyToken(token:string,client:any) {
    try {

      const ticket = await client.verifyIdToken({
        idToken: token, 
        audience: process.env.CLIENT_ID,
      });

      const payload = ticket.getPayload()

      return payload;


    } catch (error) {
      console.error('Error ') 
  
    }
  }

  //exporting the verifyToken function

  export default verifyToken;