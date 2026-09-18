export type VehicleQuery={brand?:string;model?:string;year?:number;engine?:string;version?:string;side?:"left"|"right";position?:string};
export type PartIntent={rawMessage:string;partName?:string;vehicle:VehicleQuery;confidence:number;missingFields:string[]};
export type ProductMatch={id:string;sku:string;name:string;originalCode?:string;price?:number;stock?:number;confidence:number};

export function needsClarification(intent:PartIntent){return intent.confidence<0.85||intent.missingFields.length>0;}
