import {getSuiteUser} from "@/lib/auth";
import {findCourse} from "@/lib/catalog";
import {ageBand,safeList,safeText,type CourseProposal,type Enrollment,type LearnerProfile,type PortfolioItem} from "@/lib/model";
import {loadEducation,saveEnrollment,savePortfolio,saveProfile,saveProposal} from "@/lib/store";
export const dynamic="force-dynamic";

export async function POST(request:Request){
  const user=await getSuiteUser(request.headers);if(!user)return fail("Accedi con il tuo account Tecnosocialismo.",401);
  if(!process.env.BLOB_READ_WRITE_TOKEN)return fail("Archivio didattico non configurato.",503);
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null,action=safeText(body?.action,60),now=new Date().toISOString();
  if(action==="save-profile"){
    const band=ageBand(body?.band),profile:LearnerProfile={id:user.id,userId:user.id,band,interests:safeList(body?.interests,12),accessibility:safeList(body?.accessibility,12),guardianMode:band==="3-5"||body?.guardianMode===true,updatedAt:now};
    await saveProfile(profile);return Response.json({profile,message:"Esperienza di apprendimento aggiornata."});
  }
  if(action==="enroll"){
    const course=findCourse(safeText(body?.courseId,100));if(!course)return fail("Corso non trovato.",404);
    const data=await loadEducation(user),current=data.enrollments.find((item)=>item.courseId===course.id);
    const enrollment:Enrollment=current??{id:`${user.id}-${course.id}`,userId:user.id,courseId:course.id,completedLessonIds:[],startedAt:now,updatedAt:now};
    await saveEnrollment(enrollment);return Response.json({enrollment,message:`Iscrizione a “${course.title}” confermata.`},{status:201});
  }
  if(action==="complete-lesson"){
    const course=findCourse(safeText(body?.courseId,100)),lessonId=safeText(body?.lessonId,120);if(!course||!course.modules.some((module)=>module.lessons.some((lesson)=>lesson.id===lessonId)))return fail("Lezione non trovata.",404);
    const data=await loadEducation(user),current=data.enrollments.find((item)=>item.courseId===course.id),completedLessonIds=Array.from(new Set([...(current?.completedLessonIds??[]),lessonId]));
    const enrollment:Enrollment={id:`${user.id}-${course.id}`,userId:user.id,courseId:course.id,completedLessonIds,startedAt:current?.startedAt??now,updatedAt:now};
    await saveEnrollment(enrollment);return Response.json({enrollment,message:completedLessonIds.length===course.modules.flatMap((item)=>item.lessons).length?"Percorso completato: attestato disponibile nel portfolio.":"Lezione completata. Il progresso è stato salvato."});
  }
  if(action==="add-portfolio"){
    const title=safeText(body?.title,180),description=safeText(body?.description,1500),courseId=safeText(body?.courseId,100);if(!title||!description)return fail("Aggiungi titolo e descrizione del lavoro.");
    const item:PortfolioItem={id:crypto.randomUUID(),userId:user.id,title,description,courseId,skills:safeList(body?.skills,12),visibility:body?.visibility==="comunità"?"comunità":"privato",createdAt:now};await savePortfolio(item);return Response.json({item,message:"Lavoro aggiunto al portfolio."},{status:201});
  }
  if(action==="propose-course"){
    const title=safeText(body?.title,180),description=safeText(body?.description,1800),experience=safeText(body?.experience,1000),license=safeText(body?.license,80);if(!title||!description||!experience||!license)return fail("Completa titolo, descrizione, esperienza e licenza.");
    if(!["CC BY 4.0","CC BY-SA 4.0","Pubblico dominio"].includes(license))return fail("Scegli una licenza aperta supportata.");
    const proposal:CourseProposal={id:crypto.randomUUID(),ownerId:user.id,ownerName:user.name,title,band:ageBand(body?.band),subject:safeText(body?.subject,100),description,license,experience,status:"in-revisione",createdAt:now};await saveProposal(proposal);return Response.json({proposal,message:"Proposta ricevuta: ora passa la revisione didattica e, per i minori, la verifica di tutela."},{status:201});
  }
  return fail("Azione non riconosciuta.");
}
function fail(message:string,status=400){return Response.json({error:message},{status})}
