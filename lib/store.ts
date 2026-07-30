import {get,list,put} from "@vercel/blob";
import type {SuiteUser} from "./auth";
import type {CourseProposal,Enrollment,LearnerProfile,PortfolioItem} from "./model";

const P={profiles:"education-v1/profiles/",enrollments:"education-v1/enrollments/",portfolio:"education-v1/portfolio/",proposals:"education-v1/proposals/"};

export async function loadEducation(user?:SuiteUser|null){
  if(!process.env.BLOB_READ_WRITE_TOKEN)return{profile:null,enrollments:[] as Enrollment[],portfolio:[] as PortfolioItem[],proposals:[] as CourseProposal[],storageReady:false};
  const[profile,enrollments,portfolio,proposals]=await Promise.all([
    user?readJson<LearnerProfile>(`${P.profiles}${user.id}.json`):null,
    user?listRecords<Enrollment>(`${P.enrollments}${user.id}/`):[],
    user?listRecords<PortfolioItem>(`${P.portfolio}${user.id}/`):[],
    user?listRecords<CourseProposal>(`${P.proposals}${user.id}/`):[],
  ]);
  return{profile,enrollments:newest(enrollments),portfolio:newest(portfolio),proposals:newest(proposals),storageReady:true};
}

export async function saveProfile(value:LearnerProfile){return writeJson(`${P.profiles}${value.userId}.json`,value,true)}
export async function saveEnrollment(value:Enrollment){return writeJson(`${P.enrollments}${value.userId}/${value.courseId}.json`,value,true)}
export async function savePortfolio(value:PortfolioItem){return writeJson(`${P.portfolio}${value.userId}/${value.id}.json`,value,false)}
export async function saveProposal(value:CourseProposal){return writeJson(`${P.proposals}${value.ownerId}/${value.id}.json`,value,false)}

async function listRecords<T>(prefix:string){try{const result=await list({prefix,limit:1000});const records=await Promise.all(result.blobs.map((blob)=>readJson<T>(blob.url)));return records.flatMap((item)=>item===null?[]:[item])}catch{return[]}}
async function writeJson(path:string,value:unknown,overwrite:boolean){await put(path,JSON.stringify(value),{access:"private",addRandomSuffix:false,allowOverwrite:overwrite,contentType:"application/json; charset=utf-8",cacheControlMaxAge:0});return value}
async function readJson<T>(urlOrPath:string):Promise<T|null>{try{const result=await get(urlOrPath,{access:"private",useCache:false});if(!result||result.statusCode!==200)return null;return JSON.parse(await new Response(result.stream).text()) as T}catch{return null}}
function newest<T extends{createdAt?:string;updatedAt?:string}>(items:T[]){return items.sort((a,b)=>(b.updatedAt??b.createdAt??"").localeCompare(a.updatedAt??a.createdAt??"")).slice(0,500)}
