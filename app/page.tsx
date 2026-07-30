import {getSuiteUser} from "@/lib/auth";
import EducationApp from "./education-app";
export const dynamic="force-dynamic";
export default async function Page(){return <EducationApp initialUser={await getSuiteUser()}/>}
