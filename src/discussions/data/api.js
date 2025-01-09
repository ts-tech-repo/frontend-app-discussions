/* eslint-disable import/prefer-default-export */

import { ensureConfig, getConfig } from "@edx/frontend-platform";
import { getAuthenticatedHttpClient } from "@edx/frontend-platform/auth";

ensureConfig(["LMS_BASE_URL"], "Posts API service");

export const getCourseConfigApiUrl = () =>
  `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/`;
export const getDiscussionsConfigUrl = (courseId) =>
  `${getCourseConfigApiUrl()}${courseId}/`;
/**
 * Get discussions course config
 * @param {string} courseId
 */
export async function getDiscussionsConfig(courseId) {
  try {
    const { data } = await getAuthenticatedHttpClient().get(
      getDiscussionsConfigUrl(courseId)
    );
    return data;
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(
        `${getConfig().LMS_BASE_URL}/discussions/${courseId}/not-found`
      );
    }
    throw error;
  }
}

/**
 * Get discussions course config
 * @param {string} courseId
 */
export async function getDiscussionsSettings(courseId) {
  const url = `${getDiscussionsConfigUrl(courseId)}settings`;

  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(
        `${getConfig().LMS_BASE_URL}/discussions/${courseId}/not-found`
      );
    }
    throw error;
  }
}
