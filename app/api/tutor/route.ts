import {getSuiteUser} from "@/lib/auth";
import {findCourse} from "@/lib/catalog";
import {safeText} from "@/lib/model";
export const dynamic="force-dynamic";

const BASE=process.env.INFERENCE_BASE_URL??"https://api.fireworks.ai/inference/v1";
export async function POST(request:Request){
  const user=await getSuiteUser(request.headers);if(!user)return Response.json({error:"Accedi per usare il tutor."},{status:401});
  if(!process.env.INFERENCE_API_KEY||!process.env.INFERENCE_MODEL)return Response.json({error:"Tutor non configurato."},{status:503});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null,message=safeText(body?.message,1600),course=findCourse(safeText(body?.courseId,100)),band=safeText(body?.band,20)||"adulti";
  if(!message)return Response.json({error:"Scrivi una domanda."},{status:400});
  const response=await fetch(`${BASE.replace(/\/$/,"")}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${process.env.INFERENCE_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.INFERENCE_MODEL,temperature:.35,max_tokens:650,messages:[{role:"system",content:`Sei il Tutor di Educazione Tecnosocialismo. Rispondi in italiano, con linguaggio adatto alla fascia ${band}. Aiuta a capire con domande, esempi e passaggi; non svolgere integralmente verifiche o compiti. Corso attivo: ${course?.title??"nessuno"}. Non chiedere dati personali. Per minori: nessuna conversazione privata, sessualizzata, manipolativa o invito a spostarsi altrove; se emerge pericolo, invita a parlarne subito con un adulto di fiducia e usare i servizi di emergenza appropriati. Dichiara incertezza e non inventare fonti.`},{role:"user",content:message}]})});
  if(!response.ok)return Response.json({error:"Il tutor non è disponibile in questo momento."},{status:502});
  const payload=await response.json() as {choices?:{message?:{content?:string}}[]},answer=payload.choices?.[0]?.message?.content?.trim();
  return Response.json({answer:answer||"Non sono riuscito a formulare una risposta."});
}
