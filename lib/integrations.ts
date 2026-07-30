import type {IntegrationItem} from "./model";

type VideoPayload={videos?:{id?:string;title?:string;ownerName?:string;durationSeconds?:number}[]};
type LibraryPayload={books?:{id?:string;title?:string;author?:string;category?:string}[]};

export async function loadResources(requestHeaders:Headers):Promise<IntegrationItem[]>{
  const cookie=requestHeaders.get("cookie")??"",headers=cookie?{cookie}:undefined;
  const[video,library]=await Promise.all([
    readJson<VideoPayload>("https://video.tecnosocialismo.com/api/videos?q=educazione"),
    readJson<LibraryPayload>("https://biblioteca.tecnosocialismo.com/api/dashboard",headers),
  ]);
  const videos=(video?.videos??[]).slice(0,4).flatMap((item)=>item.id&&item.title?[{id:item.id,title:item.title,url:`https://video.tecnosocialismo.com/watch/${item.id}`,kind:"video" as const,meta:item.ownerName||"Video"}]:[]);
  const books=(library?.books??[]).slice(0,4).flatMap((item)=>item.id&&item.title?[{id:item.id,title:item.title,url:"https://biblioteca.tecnosocialismo.com",kind:"libro" as const,meta:item.author||item.category||"Biblioteca"}]:[]);
  return[...videos,...books];
}

async function readJson<T>(url:string,headers?:HeadersInit):Promise<T|null>{try{const response=await fetch(url,{headers,cache:"no-store",signal:AbortSignal.timeout(3500)});return response.ok?await response.json() as T:null}catch{return null}}
