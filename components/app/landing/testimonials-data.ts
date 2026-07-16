export type Testimonial = {
  id: string;
  url?: string;
  text: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
};

export const TESTIMONIALS = [
  {
    id: "2077284160578941335",
    text: "@saurra3h crazy sick ser.",
    user: {
      name: "ajeet patel",
      username: "Iampatelajeet",
      avatar:
        "https://pbs.twimg.com/profile_images/2073764792356212736/0Ueie-5y_200x200.jpg",
      verified: true,
    },
  },
  {
    id: "2074173881599025299",
    text: "@saurra3h love the motion",
    user: {
      name: "izayl",
      username: "izayl_",
      avatar:
        "https://pbs.twimg.com/profile_images/1658144277288095744/2VpFVWpR_200x200.jpg",
      verified: false,
    },
  },
  {
    id: "2077378979590492457",
    text: "@saurra3h huge fan of this library 🙌",
    user: {
      name: "Adithya Krishna",
      username: "adii_kris",
      avatar:
        "https://pbs.twimg.com/profile_images/2071594961775321088/ItLcm5aK_200x200.jpg",
      verified: true,
    },
  },
  {
    id: "Da2GeFtkT5L",
    url: "https://www.threads.com/@treshnanda/post/Da2GeFtkT5L",
    text: "Indeed, my favorite component library right now! Thanks for releasing such an amazing component library bro!",
    user: {
      name: "Nanda",
      username: "treshnanda",
      avatar: "https://unavatar.io/threads/treshnanda",
      verified: false,
    },
  },
  {
    id: "2070915664668512304",
    text: "Really like the animations throughout @saurra3h's ui-components.\n\nA lot of the components have smooth, thoughtfully designed interactions.",
    user: {
      name: "ericts",
      username: "erictsdotcom",
      avatar:
        "https://pbs.twimg.com/profile_images/2037069613461372928/pZVqHmPg_normal.jpg",
      verified: false,
    },
  },
  {
    id: "2073486052665537002",
    text: "@saurra3h @paper Super cool!",
    user: {
      name: "Stephen Haney",
      username: "stephenhaney",
      avatar:
        "https://pbs.twimg.com/profile_images/1998948097662259200/PfaIVhfU_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2073135185370227162",
    text: "this > any metric\n\nthis is exactly why i keep building beui",
    user: {
      name: "Saurabh | NodeOps",
      username: "saurra3h",
      avatar:
        "https://pbs.twimg.com/profile_images/1865446187295178752/thuJzCdX_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2072978320036348221",
    text: "@saurra3h @paper damn just explored the components, i'm using it ASAP.",
    user: {
      name: "Amanjot Singh",
      username: "amans_twt",
      avatar:
        "https://pbs.twimg.com/profile_images/1837376254607077376/k9hrX4mP_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2070129442157191185",
    text: "@saurra3h Your Component Library is amazing been using it for a long time glad to see it constantly evolving",
    user: {
      name: "Hossain Jahed",
      username: "EaseMizeUI",
      avatar:
        "https://pbs.twimg.com/profile_images/2016098268883910657/U5EKdUq5_normal.jpg",
      verified: false,
    },
  },
  {
    id: "2073494103153586236",
    text: "@saurra3h @motiondotdev I appreciate the work you’re doing at Beui! It’s great.",
    user: {
      name: "Enes Aktaş",
      username: "ensaktas",
      avatar:
        "https://pbs.twimg.com/profile_images/2067486981840396288/p1iCw56a_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2071327003790184684",
    text: "@saurra3h just check it out looks clean, gonna use it!",
    user: {
      name: "Tyler Gibbs",
      username: "Tylerbryy",
      avatar:
        "https://pbs.twimg.com/profile_images/2068918593962536960/gmAsn6Nj_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2069456887184318562",
    text: "@saurra3h @vercel @rauchg My dude. These are great",
    user: {
      name: "Myles Franklin",
      username: "myles_franklin",
      avatar:
        "https://pbs.twimg.com/profile_images/1793338348398071808/-SrMDjm9_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2066804142719275062",
    text: "@saurra3h I’ve been looking through it in awe man it’s incredible",
    user: {
      name: "Jack",
      username: "jacksportfolio",
      avatar:
        "https://pbs.twimg.com/profile_images/2054257567350607872/Mt6Fhivs_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2071206392925765751",
    text: "@saurra3h adding this to ndle app, great work!!",
    user: {
      name: "Abhishek",
      username: "abhishk_084",
      avatar:
        "https://pbs.twimg.com/profile_images/2013536935558455296/gxHOeBex_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2069415701874720806",
    text: "@saurra3h @vercel @rauchg the animations are so cool, love to see more!",
    user: {
      name: "Thrishank",
      username: "thrishank007",
      avatar:
        "https://pbs.twimg.com/profile_images/1920539073321553920/Vgu4EqC3_normal.jpg",
      verified: false,
    },
  },
  {
    id: "2073188569506587028",
    text: "@saurra3h @shadcn love the component looks super clean!!",
    user: {
      name: "Daniel White",
      username: "dwhitedesign",
      avatar:
        "https://pbs.twimg.com/profile_images/2057915040057982976/gSIeaZnQ_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2069333890506936655",
    text: "@saurra3h @vercel @rauchg Pretty cool work, I love the animations",
    user: {
      name: "Adetunji | Software Engineer (Web & Mobile)",
      username: "itzadetunji1",
      avatar:
        "https://pbs.twimg.com/profile_images/2008803706284691456/oiK7MclR_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2071800087940870242",
    text: "@saurra3h @motiondotdev spent way too long clicking this just for the animation",
    user: {
      name: "Nick Venturi",
      username: "nickventuri",
      avatar:
        "https://pbs.twimg.com/profile_images/2047053248427638784/lY1d_G02_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2069108073839435853",
    text: "@saurra3h Loved the Glitch template. Applying to my site right now! :-)",
    user: {
      name: "Alvin",
      username: "AlvBckr",
      avatar:
        "https://pbs.twimg.com/profile_images/2066598344563052544/z8pbOXSj_normal.jpg",
      verified: true,
    },
  },
  {
    id: "2071704269816811735",
    text: "@alibey_10 @saurra3h Really nice work 🫡",
    user: {
      name: "Corentin",
      username: "CorentinClichy",
      avatar:
        "https://pbs.twimg.com/profile_images/1911752944212406272/t6lZLeFg_normal.jpg",
      verified: false,
    },
  },
  {
    id: "2069459958857650245",
    text: "@saurra3h this is gorgeous",
    user: {
      name: "AJ",
      username: "attaboiaj",
      avatar:
        "https://pbs.twimg.com/profile_images/1620798411338547200/AAlPAkWT_normal.jpg",
      verified: false,
    },
  },
  {
    id: "2071569532796256411",
    text: "SWEET!!",
    user: {
      name: "MIRACLE CHIKI 🇳🇬",
      username: "Udochiki",
      avatar:
        "https://pbs.twimg.com/profile_images/2001436282224795648/YFxqfgJB_normal.jpg",
      verified: false,
    },
  },
] satisfies Testimonial[];
