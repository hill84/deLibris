import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

const ico = (props, path) => <SvgIcon {...props} className="svg-icon"><path d={path} /></SvgIcon>;
export const icon = {
  accountPlus: p => ico(p, "M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"),
  accountCheck: p => ico(p, "M9,5A3.5,3.5 0 0,1 12.5,8.5A3.5,3.5 0 0,1 9,12A3.5,3.5 0 0,1 5.5,8.5A3.5,3.5 0 0,1 9,5M9,13.75C12.87,13.75 16,15.32 16,17.25V19H2V17.25C2,15.32 5.13,13.75 9,13.75M17,12.66L14.25,9.66L15.41,8.5L17,10.09L20.59,6.5L21.75,7.91L17,12.66Z"),
  accountCircle: p => ico(p, "M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"),
  arrowDown: p => ico(p, "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"),
  book: p => ico(p, "M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.5 6.5,20.5C8.45,20.5 10.55,20.9 12,22C13.35,21.15 15.8,20.5 17.5,20.5C19.15,20.5 20.85,20.81 22.25,21.56C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,6.05 21.75,5.75 21,5.5V7.5L21,13V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,19.15 12,20V13L12,8.5V6.5C10.55,5.4 8.45,5 6.5,5V5Z"),
  cancel: p => ico(p, "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12C4,13.85 4.63,15.55 5.68,16.91L16.91,5.68C15.55,4.63 13.85,4 12,4M12,20A8,8 0 0,0 20,12C20,10.15 19.37,8.45 18.32,7.09L7.09,18.32C8.45,19.37 10.15,20 12,20Z"),
  check: p => ico(p, "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"),
  chevronDown: p => ico(p, "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"),
  chevronLeft: p => ico(p, "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"),
  chevronRight: p => ico(p, "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"),
  close: p => ico(p, "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"),
  comment: p => ico(p, "M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z"),
  dashboard: p => ico(p, "M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"),
  delete: p => ico(p, "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"),
  dotsVertical: p => ico(p, "M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"),
  eye: p => ico(p, "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"),
  formatSize: p => ico(p, "M3,12H6V19H9V12H12V9H3M9,4V7H14V19H17V7H22V4H9Z"),
  heart: p => ico(p, "M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"),
  heartOutline: p => ico(p, "M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"),
  home: p => ico(p, "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"),
  informationOutline: p => ico(p, "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"),
  lamp: p => ico(p, "M8,2H16L20,14H4L8,2M11,15H13V20H18V22H6V20H11V15Z"),
  lightbulb: p => ico(p, "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"),
  lock: p => ico(p, "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),
  lockOpen: p => ico(p, "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z"),
  lockReset: p => ico(p, "M12.63,2C18.16,2 22.64,6.5 22.64,12C22.64,17.5 18.16,22 12.63,22C9.12,22 6.05,20.18 4.26,17.43L5.84,16.18C7.25,18.47 9.76,20 12.64,20A8,8 0 0,0 20.64,12A8,8 0 0,0 12.64,4C8.56,4 5.2,7.06 4.71,11H7.47L3.73,14.73L0,11H2.69C3.19,5.95 7.45,2 12.63,2M15.59,10.24C16.09,10.25 16.5,10.65 16.5,11.16V15.77C16.5,16.27 16.09,16.69 15.58,16.69H10.05C9.54,16.69 9.13,16.27 9.13,15.77V11.16C9.13,10.65 9.54,10.25 10.04,10.24V9.23C10.04,7.7 11.29,6.46 12.81,6.46C14.34,6.46 15.59,7.7 15.59,9.23V10.24M12.81,7.86C12.06,7.86 11.44,8.47 11.44,9.23V10.24H14.19V9.23C14.19,8.47 13.57,7.86 12.81,7.86Z"),
  loginVariant: p => ico(p, "M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.41L12.67,11H3V13H12.67L10.08,15.58Z"),
  logoutVariant: p => ico(p, "M14.08,15.59L16.67,13H7V11H16.67L14.08,8.41L15.5,7L20.5,12L15.5,17L14.08,15.59M19,3A2,2 0 0,1 21,5V9.67L19,7.67V5H5V19H19V16.33L21,14.33V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19Z"),
  menuDown: p => ico(p, "M7,10L12,15L17,10H7Z"),
  messageTextOutline: p => ico(p, "M20,2A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H6L2,22V4C2,2.89 2.9,2 4,2H20M4,4V17.17L5.17,16H20V4H4M6,7H18V9H6V7M6,11H15V13H6V11Z"),
  newBox: p => ico(p, "M20,4C21.11,4 22,4.89 22,6V18C22,19.11 21.11,20 20,20H4C2.89,20 2,19.11 2,18V6C2,4.89 2.89,4 4,4H20M8.5,15V9H7.25V12.5L4.75,9H3.5V15H4.75V11.5L7.3,15H8.5M13.5,10.26V9H9.5V15H13.5V13.75H11V12.64H13.5V11.38H11V10.26H13.5M20.5,14V9H19.25V13.5H18.13V10H16.88V13.5H15.75V9H14.5V14A1,1 0 0,0 15.5,15H19.5A1,1 0 0,0 20.5,14Z"),
  pencil: p => ico(p, "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"),
  pencilOff: p => ico(p, "M18.66,2C18.4,2 18.16,2.09 17.97,2.28L16.13,4.13L19.88,7.88L21.72,6.03C22.11,5.64 22.11,5 21.72,4.63L19.38,2.28C19.18,2.09 18.91,2 18.66,2M3.28,4L2,5.28L8.5,11.75L4,16.25V20H7.75L12.25,15.5L18.72,22L20,20.72L13.5,14.25L9.75,10.5L3.28,4M15.06,5.19L11.03,9.22L14.78,12.97L18.81,8.94L15.06,5.19Z"),
  plus: p => ico(p, "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"),
  plusCircle: p => ico(p, "M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"),
  reader: p => ico(p, "M12,8A3,3 0 0,0 15,5A3,3 0 0,0 12,2A3,3 0 0,0 9,5A3,3 0 0,0 12,8M12,11.54C9.64,9.35 6.5,8 3,8V19C6.5,19 9.64,20.35 12,22.54C14.36,20.35 17.5,19 21,19V8C17.5,8 14.36,9.35 12,11.54Z"),
  review: p => ico(p, "M18,14H10.5L12.5,12H18M6,14V11.5L12.88,4.64C13.07,4.45 13.39,4.45 13.59,4.64L15.35,6.41C15.55,6.61 15.55,6.92 15.35,7.12L8.47,14M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z"),
  sortAscending: p => ico(p, "M10,11V13H18V11H10M10,5V7H14V5H10M10,17V19H22V17H10M6,7H8.5L5,3.5L1.5,7H4V20H6V7Z"),
  sortDescending: p => ico(p, "M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V4H6V17Z"),
  star: p => ico(p, "M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"),
  starOutline: p => ico(p, "M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"),
  textboxPassword: p => ico(p, "M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H13V9H4V15H13V17H2V7M20,15V9H17V15H20M8.5,12A1.5,1.5 0 0,0 7,10.5A1.5,1.5 0 0,0 5.5,12A1.5,1.5 0 0,0 7,13.5A1.5,1.5 0 0,0 8.5,12M13,10.89C12.39,10.33 11.44,10.38 10.88,11C10.32,11.6 10.37,12.55 11,13.11C11.55,13.63 12.43,13.63 13,13.11V10.89Z"),
  timer: p => ico(p, "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z"),
  thumbUp: p => ico(p, "M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z"),
  thumbUpOutline: p => ico(p, "M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"),
  viewGrid: p => ico(p, "M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"),
  viewSequential: p => ico(p, "M3,4H21V8H3V4M3,10H21V14H3V10M3,16H21V20H3V16Z")
  //name: p => ico(p, "..."),
};