import {getSuiteUser} from "@/lib/auth";
import {courses,pathways} from "@/lib/catalog";
import {loadResources} from "@/lib/integrations";
import type {Certificate,EducationDashboard} from "@/lib/model";
import {loadEducation} from "@/lib/store";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  const user=await getSuiteUser(request.headers);
  const[data,resources]=await Promise.all([loadEducation(user),loadResources(request.headers)]);
  const certificates:Certificate[]=data.enrollments.flatMap((enrollment)=>{const course=courses.find((item)=>item.id===enrollment.courseId);if(!course)return[];const lessonIds=course.modules.flatMap((module)=>module.lessons.map((lesson)=>lesson.id));return lessonIds.length>0&&lessonIds.every((id)=>enrollment.completedLessonIds.includes(id))?[{courseId:course.id,courseTitle:course.title,issuedAt:enrollment.updatedAt,verificationId:`EDU-${enrollment.userId.slice(-5).toUpperCase()}-${course.id.toUpperCase()}`}]:[]});
  const dashboard:EducationDashboard={viewerId:user?.id??null,viewerName:user?.name??null,...data,certificates,courses,pathways,resources};
  return Response.json(dashboard,{headers:{"Cache-Control":"private, no-store"}});
}
