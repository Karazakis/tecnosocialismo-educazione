export type AgeBand="3-5"|"6-10"|"11-13"|"14-18"|"adulti";
export type CourseLevel="iniziale"|"intermedio"|"avanzato";
export type LessonKind="video"|"lettura"|"laboratorio"|"quiz"|"progetto";

export type Lesson={id:string;title:string;kind:LessonKind;minutes:number;description:string};
export type Module={id:string;title:string;outcome:string;lessons:Lesson[]};
export type Course={id:string;title:string;subtitle:string;band:AgeBand;subject:string;level:CourseLevel;weeks:number;color:string;teacher:string;license:string;skills:string[];modules:Module[];featured?:boolean};
export type Pathway={id:string;band:AgeBand;eyebrow:string;title:string;description:string;duration:string;courseIds:string[];outcomes:string[]};
export type LearnerProfile={id:string;userId:string;band:AgeBand;interests:string[];accessibility:string[];guardianMode:boolean;updatedAt:string};
export type Enrollment={id:string;userId:string;courseId:string;completedLessonIds:string[];startedAt:string;updatedAt:string};
export type PortfolioItem={id:string;userId:string;title:string;description:string;courseId:string;skills:string[];visibility:"privato"|"comunità";createdAt:string};
export type CourseProposal={id:string;ownerId:string;ownerName:string;title:string;band:AgeBand;subject:string;description:string;license:string;experience:string;status:"in-revisione";createdAt:string};
export type Certificate={courseId:string;courseTitle:string;issuedAt:string;verificationId:string};
export type IntegrationItem={id:string;title:string;url:string;kind:"video"|"libro";meta:string};
export type EducationDashboard={viewerId:string|null;viewerName:string|null;storageReady:boolean;profile:LearnerProfile|null;enrollments:Enrollment[];portfolio:PortfolioItem[];proposals:CourseProposal[];certificates:Certificate[];courses:Course[];pathways:Pathway[];resources:IntegrationItem[]};

export function safeText(value:unknown,max=500){return typeof value==="string"?value.trim().slice(0,max):""}
export function safeList(value:unknown,max=12){return Array.isArray(value)?value.map((item)=>safeText(item,80)).filter(Boolean).slice(0,max):[]}
export function ageBand(value:unknown):AgeBand{return ["3-5","6-10","11-13","14-18","adulti"].includes(String(value))?value as AgeBand:"adulti"}
