// import React, { useState, useRef, useEffect } from 'react';
// import { Markmap } from 'markmap-view';
// import { transformer } from './markmap';
// import { Toolbar } from 'markmap-toolbar';
// import 'markmap-toolbar/dist/style.css';

// const initValue = `# Chhatrapati Shivaji Maharaj

// ## Early Life
// - Born: February 19, 1627 (Disputed, officially recognized on 19 Feb)
// - Birthplace: Shivneri Fort, Pune district
// - Named after: Goddess Shivai Devi
// - Descended from a noble family

// ## Political Context
// - India under Mughal and Deccan Sultanates
// - Muslim rulers oppressed Hindus
// - Inspired by the cause of Hindu freedom

// ## Rise to Power
// - Began military campaigns at age 16
// - Seized weaker Bijapur outposts (~1655)
// - Gained admiration for military skill and justice

// ## Key Battles and Strategies
// ### Against Bijapur
// - 1659: Defeated Afzal Khan by luring him into mountain terrain
// - Seized Bijapur’s army resources

// ### Against Mughals
// - Conducted a daring midnight raid on Mughal viceroy
// - Sacked Surat
// - Aurangzeb sent Mirza Raja Jai Singh with 100,000 troops
// - Forced to sue for peace, attended Aurangzeb’s court at Agra

// ## Escape from Agra
// - Feigned illness, hid in sweet baskets
// - Escaped with his son on August 17, 1666
// - Changed Indian history

// ## Maratha Empire
// - 1674: Coronation as Chhatrapati at Raigad
// - Established an independent Hindu kingdom
// - Ruled with a cabinet of eight ministers
// - Allowed reconversion of Hindus from Islam
// - Respected religious beliefs of all communities

// ## Final Years
// - Faced internal discord and betrayal
// - Son defected to the Mughals (later returned)
// - Died: April 3, 1680, at Raigad Fort

// ## Legacy
// - Inspired Hindu self-rule (Hindavi Swarajya)
// - Practiced religious tolerance
// - Fought against powerful Islamic empires
// - Maratha Empire continued after his death

// ## Maratha Empire Overview
// - Established by Shivaji in 1674
// - Expanded across India in the 18th century
// - Ended in 1818 after defeat by the British
// - Key enemy: Mughals, Deccan Sultanates, and English East India Company
// - Army: Mobile warrior clans, primarily from Maharashtra`;

// function renderToolbar(mm: Markmap, wrapper: HTMLElement) {
//   while (wrapper?.firstChild) wrapper.firstChild.remove();
//   if (mm && wrapper) {
//     const toolbar = new Toolbar();
//     toolbar.attach(mm);
//     // Register custom buttons
//     toolbar.register({
//       id: 'alert',
//       title: 'Click to show an alert',
//       content: 'Alert',
//       onClick: () => alert('You made it!'),
//     });
//     toolbar.setItems([...Toolbar.defaultItems, 'alert']);
//     wrapper.append(toolbar.render());
//   }
// }

// export default function Mindmap() {
//   const [value, setValue] = useState(initValue);
//   // Ref for SVG element
//   const refSvg = useRef<SVGSVGElement>();
//   // Ref for markmap object
//   const refMm = useRef<Markmap>();
//   // Ref for toolbar wrapper
//   const refToolbar = useRef<HTMLDivElement>();

//   useEffect(() => {
//     // Create markmap and save to refMm
//     if (refMm.current) return;
//     const mm = Markmap.create(refSvg.current);
//     console.log('create', refSvg.current);
//     refMm.current = mm;
//     renderToolbar(refMm.current, refToolbar.current);
//   }, [refSvg.current]);

//   useEffect(() => {
//     // Update data for markmap once value is changed
//     const mm = refMm.current;
//     if (!mm) return;
//     const { root } = transformer.transform(value);
//     mm.setData(root).then(() => {
//       mm.fit();
//     });
//   }, [refMm.current, value]);

//   const handleChange = (e) => {
//     setValue(e.target.value);
//   };

//   return (
//     <React.Fragment>
//       <div className="flex-1">
//         <textarea
//           className="w-full h-full border border-gray-400"
//           value={value}
//           onChange={handleChange}
//         />
//       </div>
//       <svg className="flex-1" ref={refSvg} />
//       <div className="absolute bottom-1 right-1" ref={refToolbar}></div>
//     </React.Fragment>
//   );
// }