export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req:Request){
  try{
    const { adminUid } = await req.json();
    const db = adminDb();
    const adminDoc = await db.collection("users").doc(adminUid).get();
    if(!adminDoc.exists || adminDoc.data()?.role!=="admin") return NextResponse.json({ok:false,error:"no autorizado"},{status:403});

    const cols = ["history","wineAnalyses"];
    let deleted = 0;
    for (const c of cols){
      const s1 = await db.collection(c).where("wineName","==","Dummy Wine (seed)").get();
      const s2 = await db.collection(c).where("wineName","==","Dummy Wine (Seed)").get();
      const batch = db.batch();
      [...s1.docs,...s2.docs].forEach(d=>batch.delete(d.ref));
      if ((s1.size+s2.size)>0) { await batch.commit(); deleted += (s1.size+s2.size); }
    }
    return NextResponse.json({ok:true, deleted});
  }catch(e:any){ return NextResponse.json({ok:false,error:String(e?.message||e)},{status:500}); }
}