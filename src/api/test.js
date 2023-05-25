import request from "@/utils/request"; // request.js request/index.js

// api举例

// get请求
export const getHistoryApi = (params) => {
  return request({
    url: `/users/history.jsp`,
    method: "get",
    params,
  });
};

// post请求
export const postCommon = (params) => {
  return request({
    url: `/common/` + params.type,
    method: "post",
    data: params.information,
  });
};
