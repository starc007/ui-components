"use client";
import { ShowButtons, ShowNavbars } from "@/components";
import ComingSoon from "@/components/appComp/ComingSoon";
import { SIDE_NAV_ROUTES } from "@/utils/constants";
import React, { useMemo } from "react";

const Index = ({ params }: { params: { slug: string } }) => {
  const paramSlug = params?.slug || "buttons";

  const content = useMemo(() => {
    switch (paramSlug) {
      case SIDE_NAV_ROUTES.BUTTONS:
        return <ShowButtons />;
      case SIDE_NAV_ROUTES.NAVBARS:
        return <ShowNavbars />;
      case SIDE_NAV_ROUTES.INPUTS:
        return <ComingSoon />;
      case SIDE_NAV_ROUTES.TABS:
        return <ComingSoon />;
      case SIDE_NAV_ROUTES.HERO:
        return <ComingSoon />;
      case SIDE_NAV_ROUTES.FOOTER:
        return <ComingSoon />;
      default:
        return <div>Not Found</div>;
    }
  }, [paramSlug]);

  return content;
};

export default Index;