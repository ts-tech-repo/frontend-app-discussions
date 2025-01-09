/* eslint-disable react/jsx-no-constructed-context-values */
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { useSelector } from "react-redux";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";

import { LearningHeader as Header } from "@edx/frontend-component-header";

import { Spinner } from "../../components";
import { selectCourseTabs } from "../../components/NavigationBar/data/selectors";
import { ALL_ROUTES, DiscussionProvider, Routes } from "../../data/constants";
import { DiscussionContext } from "../common/context";
import {
  useCourseDiscussionData,
  useIsOnDesktop,
  useRedirectToThread,
  useShowLearnersTab,
  useSidebarVisible,
} from "../data/hooks";
import {
  selectDiscussionProvider,
  selectEnableInContext,
} from "../data/selectors";
import { EmptyLearners, EmptyPosts, EmptyTopics } from "../empty-posts";
import { EmptyTopic as InContextEmptyTopics } from "../in-context-topics/components";
import messages from "../messages";
import { selectPostEditorVisible } from "../posts/data/selectors";
import useFeedbackWrapper from "./FeedbackWrapper";
import NotFound from "./notFound";
import { Alert } from "@edx/paragon";
import { WarningFilled } from "@edx/paragon/icons";
import { FormattedMessage } from "@edx/frontend-platform/i18n";

const Footer = lazy(() => import("@edx/frontend-component-footer"));
const PostActionsBar = lazy(() =>
  import("../posts/post-actions-bar/PostActionsBar")
);
const CourseTabsNavigation = lazy(() =>
  import("../../components/NavigationBar/CourseTabsNavigation")
);
const LegacyBreadcrumbMenu = lazy(() =>
  import("../navigation/breadcrumb-menu/LegacyBreadcrumbMenu")
);
const NavigationBar = lazy(() =>
  import("../navigation/navigation-bar/NavigationBar")
);
const DiscussionsProductTour = lazy(() =>
  import("../tours/DiscussionsProductTour")
);
const DiscussionsRestrictionBanner = lazy(() =>
  import("./DiscussionsRestrictionBanner")
);
const DiscussionContent = lazy(() => import("./DiscussionContent"));
const DiscussionSidebar = lazy(() => import("./DiscussionSidebar"));

const DiscussionsHome = ({ intl }) => {
  const location = useLocation();
  const [unAuthUser, setUnAuthUser] = useState(false);
  const postActionBarRef = useRef(null);
  const postEditorVisible = useSelector(selectPostEditorVisible);
  const provider = useSelector(selectDiscussionProvider);
  const enableInContext = useSelector(selectEnableInContext);
  const config = useSelector((state) => state.config);

  // You can now use the config state in your component
  console.log(config, "configggg");
  const { courseNumber, courseTitle, org } = useSelector(selectCourseTabs);
  const {
    params: { page },
  } = useRouteMatch(`${Routes.COMMENTS.PAGE}?`);
  const { params } = useRouteMatch(ALL_ROUTES);
  const isRedirectToLearners = useShowLearnersTab();
  const isOnDesktop = useIsOnDesktop();
  let displaySidebar = useSidebarVisible();
  const enableInContextSidebar = Boolean(
    new URLSearchParams(location.search).get("inContextSidebar") !== null
  );
  const { courseId, postId, topicId, category, learnerUsername } = params;

  useCourseDiscussionData(courseId);
  useRedirectToThread(courseId, enableInContextSidebar);
  useFeedbackWrapper();
  /*  Display the content area if we are currently viewing/editing a post or creating one.
  If the window is larger than a particular size, show the sidebar for navigating between posts/topics.
  However, for smaller screens or embeds, onlyshow the sidebar if the content area isn't displayed. */
  const displayContentArea =
    postId || postEditorVisible || (learnerUsername && postId);
  if (displayContentArea) {
    displaySidebar = isOnDesktop;
  }

  useEffect(() => {
    console.log(location, intl, "this is location");
    if (location?.pathname.includes("not-found")) {
      setUnAuthUser(true);
    } else {
      setUnAuthUser(false);
    }
  }, []);

  return (
    <Suspense fallback={<Spinner />}>
      <DiscussionContext.Provider
        value={{
          page,
          courseId,
          postId,
          topicId,
          enableInContextSidebar,
          category,
          learnerUsername,
        }}
      >
        {!enableInContextSidebar && (
          <Header
            courseOrg={org}
            courseNumber={courseNumber}
            courseTitle={courseTitle}
          />
        )}
        <div className="mx-5 mt-3 px-5" style={{ height: "fit-content" }}>
          {unAuthUser || config?.status === "denied" (
            <Alert variant="warning" icon={WarningFilled} className="mb-3">
              {/* <p>You must be enrolled in the course to see course content.</p> */}
              <FormattedMessage
                id="learning.enrollment.alert"
                defaultMessage="You must be enrolled in the course to see discussion content."
                description="Message shown to indicate that a user needs to enroll in a course prior to viewing the course content.  Shown as part of an alert, along with a link to enroll."
              />
            </Alert>
          )}
        </div>

        <main
          className="container-fluid d-flex flex-column p-0 w-100"
          id="main"
          tabIndex="-1"
          style={unAuthUser ? {height: "65vh"} : {}}
        >
          {!unAuthUser || config?.status === "denied" (
            <>
              {!enableInContextSidebar && (
                <CourseTabsNavigation
                  activeTab="discussion"
                  courseId={courseId}
                />
              )}
              <div
                className={classNames("header-action-bar", {
                  "shadow-none border-light-300 border-bottom":
                    enableInContextSidebar,
                })}
                ref={postActionBarRef}
              >
                <div
                  className={classNames(
                    "d-flex flex-row justify-content-between navbar fixed-top",
                    {
                      "pl-4 pr-3 py-0": enableInContextSidebar,
                    }
                  )}
                >
                  {!enableInContextSidebar && <NavigationBar />}
                  <PostActionsBar />
                </div>
                <DiscussionsRestrictionBanner />
              </div>
              {provider === DiscussionProvider.LEGACY && (
                <Suspense fallback={<Spinner />}>
                  <Route
                    path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
                    component={LegacyBreadcrumbMenu}
                  />
                </Suspense>
              )}
              <div className="d-flex flex-row position-relative">
                <Suspense fallback={<Spinner />}>
                  <DiscussionSidebar
                    displaySidebar={displaySidebar}
                    postActionBarRef={postActionBarRef}
                  />
                </Suspense>
                {displayContentArea && (
                  <Suspense fallback={<Spinner />}>
                    <DiscussionContent />
                  </Suspense>
                )}
                {!displayContentArea && (
                  <Switch>
                    <Route
                      path={Routes.TOPICS.PATH}
                      component={
                        enableInContext || enableInContextSidebar
                          ? InContextEmptyTopics
                          : EmptyTopics
                      }
                    />
                    <Route
                      path={Routes.POSTS.MY_POSTS}
                      render={(routeProps) => (
                        <EmptyPosts
                          {...routeProps}
                          subTitleMessage={messages.emptyMyPosts}
                        />
                      )}
                    />
                    <Route
                      path={[
                        Routes.POSTS.PATH,
                        Routes.POSTS.ALL_POSTS,
                        Routes.LEARNERS.POSTS,
                      ]}
                      render={(routeProps) => (
                        <EmptyPosts
                          {...routeProps}
                          subTitleMessage={messages.emptyAllPosts}
                        />
                      )}
                    />
                    {/* <Route path={Routes.NOT_FOUND.PATH} component={NotFound} /> */}
                    {isRedirectToLearners && (
                      <Route
                        path={Routes.LEARNERS.PATH}
                        component={EmptyLearners}
                      />
                    )}
                  </Switch>
                )}
              </div>
              {!enableInContextSidebar && <DiscussionsProductTour />}
            </>
          )}
        </main>
        {!enableInContextSidebar && <Footer />}
      </DiscussionContext.Provider>
    </Suspense>
  );
};

export default React.memo(DiscussionsHome);
