/** @jsxImportSource solid-js */
import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import { mockIPC } from "@tauri-apps/api/mocks";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { Motion } from "solid-motionone";
import ChampionsRoute from "@/features/champions/routes/ChampionsRoute";
import { championsI18n } from "@/features/champions/i18n";
import { initializeSolidI18n } from "@/i18n/solid";
import * as shell from "@/layout/__root.css";
import "@/styles/global.css";
initializeSolidI18n(championsI18n,"zh-CN");
const ids=[222,412,201,62,89,53,40,18,31,245,54,103,516,157,145,236,81,266,67,86,24,64,84,22,99,202,110,51,117,43];
const build=(ids:number[],winRate=.525)=>({ids,winRate,pickRate:.42,play:3518});
mockIPC(async(command,args)=>{
 await new Promise(resolve=>setTimeout(resolve,250));
 if(command==="opgg_list_champions")return {version:"16.19",champions:ids.map((id,i)=>({id,winRate:.525-i*.0008,pickRate:.169,banRate:.086,tier:1+i%4,positions:[{position:"ADC",winRate:.525,pickRate:.169,roleRate:.8}]}))};
 if(command==="opgg_get_champion_detail")return {id:args.championId,position:args.position,version:"16.19",winRate:.525,pickRate:.169,banRate:.086,tier:1,skillPriority:["Q","W","E"],skillOrder:["Q","W","E","Q","Q","R","Q","W","Q","W","W","R","W","E","E"],skillWinRate:.611,skillPickRate:.992,summonerSpells:[build([6,4])],starterItems:[build([1055,2003,2003])],boots:[build([3006])],coreItems:[build([3031,3085,6672],.593),build([3031,6672,3094],.538),build([3031,3036,6672],.599)],lastItems:[3031,3085,6672,3094,3036].map(id=>build([id])),strongAgainst:ids.slice(1,25).map((championId,i)=>({championId,winRate:.56-i*.002,play:778+i*597})),weakAgainst:ids.slice(2,26).map((championId,i)=>({championId,winRate:.441+i*.001,play:451+i*431}))};
});
function Preview(){const [mounted,setMounted]=createSignal(false);return <div class={shell.shell} style={assignInlineVars({[shell.sidebarWidth]:"12rem 1fr"})}>
 <div class={shell.logoButton}>Jax</div><header><button onClick={()=>setMounted(!mounted())}>切换英雄页面</button> · 完整布局和异步加载验证</header>
 <aside class={shell.sidebar}>英雄</aside>
 <main class={shell.main}><div class={shell.routeTransitionSurface}><Show when={mounted()}><Motion.div class={shell.routeLayer} initial={{opacity:.65}} animate={{opacity:1}} transition={{duration:.26}}><ChampionsRoute/></Motion.div></Show></div></main>
 </div>}
render(()=><Preview/>,document.getElementById("root")!);
