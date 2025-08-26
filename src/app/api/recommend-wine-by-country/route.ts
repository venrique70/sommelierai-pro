export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

function titleCase(s:string){ return s? s.charAt(0).toUpperCase()+s.slice(1): s; }

function fallbackReco(body:any){
  const style = String(body?.style||"Malbec");
  const lang  = (String(body?.language||"es").toLowerCase()==="en")?"en":"es";

  const baseES = [
    { wineName:"Altos Las Hormigas Malbec", reason:"Fruta roja madura, tanino amable y buena acidez; acompaña cortes jugosos sin saturar.", rating:5 },
    { wineName:"Susana Balbo Malbec",      reason:"Perfume intenso, roble integrado y centro de boca amplio; marida carnes asadas.",        rating:5 },
    { wineName:"Catena Malbec",            reason:"Equilibrio entre fruta, acidez y crianza; versátil para parrilla y pastas.",            rating:5 },
    { wineName:"Luigi Bosca Malbec",       reason:"Estructura media-alta con final especiado; ideal para cortes con grasa media.",         rating:4 },
    { wineName:"Nieto Senetiner Malbec",   reason:"Perfil clásico y directo, gran relación precio-calidad para diario.",                   rating:4 }
  ];
  const baseEN = [
    { wineName:"Altos Las Hormigas Malbec", reason:"Ripe red fruit, gentle tannins and fresh acidity; supports juicy steaks without overpowering.", rating:5 },
    { wineName:"Susana Balbo Malbec",      reason:"Expressive nose, well-integrated oak and broad mid-palate; great with roasted meats.",          rating:5 },
    { wineName:"Catena Malbec",            reason:"Balanced fruit, acidity and barrel touch; versatile for grill and pasta.",                       rating:5 },
    { wineName:"Luigi Bosca Malbec",       reason:"Medium-full body with spicy finish; ideal for medium-fat cuts.",                                 rating:4 },
    { wineName:"Nieto Senetiner Malbec",   reason:"Classic straightforward profile with excellent value.",                                          rating:4 }
  ];
  const list = lang==="en"? baseEN: baseES;

  // si piden otro estilo, reemplazar etiqueta visual para no confundir en demo
  return list.map(x => ({
    wineName: x.wineName.replace(/Malbec/i, titleCase(style)),
    reason: x.reason,
    justificacionExperta: x.reason,
    rating: x.rating
  }));
}

export async function POST(req: Request){
  try{
    const body = await req.json().catch(()=>({}));
    const out = fallbackReco(body);
    return NextResponse.json({ recommendations: out });
  }catch(e:any){
    return NextResponse.json({ recommendations: fallbackReco({}), error: String(e?.message||e) }, { status:200 });
  }
}