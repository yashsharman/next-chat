"use client";
import React, { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

import "./style.css";
import Image from "next/image";
import aiProfile from "../public/images/png/bot.png";
import ProfileIcons from "../public/images/png/user.png";
import deleteIcon from "../public/images/svg/delete.svg";

import { Dropdown, Space } from "antd";

const genAI = new GoogleGenerativeAI("AIzaSyBQtvI9iIa_zRCoTcrnEeAd1C5nE93dejs");
const defaultChat = [
  {
    chatType: "left_message",
    message: "Hello there! How can I help you.",
  },
];

const items = [
  {
    label: (
      <div className="taskboard_more_options">
        <Image src={deleteIcon} width={18} alt="task_history" />{" "}
        <span>Delete</span>
      </div>
    ),
    key: "1",
  },
];

function Home() {
  const [chatData, setChatData] = useState(defaultChat);
  const [text, setText] = useState("generate");
  const expandBtn = useRef(null);
  const sideBar = useRef(null);
  const inputContainer = useRef(null);
  const inputArea = useRef(null);
  const dayLables = useRef([]);
  const chatBox = useRef(null);
  const scrollBtm = useRef(null);

  const toggleSideBar = () => {
    // console.log("called");
    if (
      sideBar.current &&
      inputContainer.current &&
      dayLables.current &&
      expandBtn.current
    ) {
      if (sideBar.current.style.maxWidth === "0px") {
        sideBar.current.style.paddingRight = "0.5rem";
        sideBar.current.style.paddingLeft = "0.5rem";
        sideBar.current.style.maxWidth = "250px";
        sideBar.current.style.minWidth = "250px";
        dayLables.current.forEach((dayLabel) => {
          dayLabel.style.visibility = "visible";
        });
        expandBtn.current.style.transform = "rotate(0deg)";

        inputContainer.current.style.width = "calc(100% - 250px)";
      } else {
        sideBar.current.style.maxWidth = "0px";
        sideBar.current.style.minWidth = "0px";
        sideBar.current.style.paddingRight = "0";
        sideBar.current.style.paddingLeft = "0";
        inputContainer.current.style.width = "100%";
        expandBtn.current.style.transform = "rotate(180deg)";

        dayLables.current.forEach((dayLabel) => {
          // dayLabel.style.display = "none";
          dayLabel.style.visibility = "hidden";
          // console.log(dayLabel);
        });
      }
    }
  };

  const scrollToBottom = () => {
    if (chatBox.current) {
      chatBox.current.scrollTop = chatBox.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (chatBox.current) {
      const isScrolledToBottom =
        chatBox.current.scrollHeight - chatBox.current.scrollTop ===
        chatBox.current.clientHeight;
      if (isScrolledToBottom) {
        scrollBtm.current.style.display = "none";
      } else {
        scrollBtm.current.style.display = "flex";
      }
    }
  };

  const handleUserInput = () => {
    setChatData((prev) => [
      ...prev,
      { chatType: "right_message", message: inputArea.current.value },
    ]);
    run();
  };

  function convertToHTML(response) {
    // console.log(response[0]);
    const text = response[0].content.parts[0].text;

    // Basic formatting (replace with your desired formatting logic)
    const formattedText = text
      .replace(/\n\n/g, "</p><p>") // Replace double newlines with closing and opening paragraph tags
      .replace(/\n/g, "<br />") // Replace single newlines with HTML line breaks
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold text wrapped in double asterisks
      .replace(/_(.+?)_/g, "<em>$1</em>"); // Italicize text wrapped in underscores

    return formattedText;
  }

  async function run() {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const conversationHistory = chatData
      .map((message) => `${message.chatType}: ${message.message}`)
      .join("\n");
    const prompt = `${conversationHistory}\n${inputArea.current.value} return answer in only html tags and dont add html identifiers. If a user asks to give results related to code or wants result in code return that result in <code> tag`;

    const result = await model.generateContent(prompt);

    // for await (const item of result.stream) {
    //   // console.log("stream chunk: ", JSON.stringify(item));
    // }
    // const response = await result.response;

    // console.log("aggregated response: ", response);

    const response = await result.response.candidates;
    const text = response[0].content.parts[0].text;
    console.log(response);
    setChatData((prev) => [
      ...prev,
      { chatType: "left_message", message: text },
    ]);
    inputArea.current ? (inputArea.current.value = "") : null;

    // setText(text);
  }

  useEffect(() => {
    if (chatBox.current) {
      chatBox.current.addEventListener("scroll", handleScroll);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (chatBox.current) {
        chatBox.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    // scrollToBottom();
    console.log(chatData);
  }, [chatData]);

  return (
    <div className="circular_viewer_container ">
      <div className="circularViewer">
        <div className="viewer_header">
          <div className="title">
            <svg
              width="29"
              height="31"
              viewBox="0 0 30 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.2016 14.1506H6.10625C4.75747 14.1506 3.66406 15.244 3.66406 16.5928V23.9194C3.66406 25.2682 4.75747 26.3616 6.10625 26.3616H23.2016C24.5504 26.3616 25.6438 25.2682 25.6438 23.9194V16.5928C25.6438 15.244 24.5504 14.1506 23.2016 14.1506Z"
                stroke="#34416B"
                stroke-width="2.44219"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14.6531 9.26646C16.0019 9.26646 17.0953 8.17305 17.0953 6.82427C17.0953 5.47549 16.0019 4.38208 14.6531 4.38208C13.3043 4.38208 12.2109 5.47549 12.2109 6.82427C12.2109 8.17305 13.3043 9.26646 14.6531 9.26646Z"
                stroke="#34416B"
                stroke-width="2.44219"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14.6562 9.26611V14.1505"
                stroke="#34416B"
                stroke-width="2.44219"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="9.76797" cy="20.2563" r="1.22109" fill="#34416B" />
              <circle cx="19.5414" cy="20.2563" r="1.22109" fill="#34416B" />
            </svg>{" "}
            Master AI
            <svg
              width={19}
              height={18}
              viewBox="0 0 19 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9.30469"
                cy={9}
                r="8.4375"
                fill="white"
                stroke="#7A87AD"
                strokeWidth="1.125"
              />
              <path
                d="M8.29448 11.4414V11.3769C8.30214 10.6922 8.37867 10.1472 8.52408 9.74211C8.66948 9.337 8.87612 9.00896 9.14397 8.75801C9.41183 8.50705 9.73326 8.27581 10.1083 8.06429C10.334 7.93523 10.5368 7.78286 10.7167 7.60719C10.8965 7.42794 11.0381 7.2218 11.1414 6.98877C11.2486 6.75574 11.3021 6.49761 11.3021 6.21439C11.3021 5.86305 11.2141 5.55832 11.0381 5.30019C10.8621 5.04206 10.6268 4.84309 10.3321 4.70327C10.0375 4.56346 9.7103 4.49355 9.35061 4.49355C9.03683 4.49355 8.73453 4.55449 8.44372 4.67639C8.1529 4.79828 7.90992 4.99008 7.71476 5.25179C7.51961 5.5135 7.40673 5.85588 7.37612 6.27892H5.92969C5.9603 5.66946 6.12867 5.14783 6.43479 4.71403C6.74474 4.28023 7.15226 3.94861 7.65737 3.71917C8.16629 3.48972 8.73071 3.375 9.35061 3.375C10.0241 3.375 10.6095 3.50048 11.107 3.75143C11.6083 4.00239 11.9947 4.34656 12.2664 4.78394C12.5419 5.22132 12.6797 5.71965 12.6797 6.27892C12.6797 6.67328 12.6146 7.03 12.4845 7.34907C12.3583 7.66814 12.1746 7.95315 11.9335 8.20411C11.6963 8.45507 11.4093 8.67734 11.0725 8.87094C10.7358 9.06812 10.466 9.27605 10.2632 9.49474C10.0604 9.70985 9.91311 9.96618 9.82127 10.2637C9.72943 10.5613 9.67969 10.9324 9.67203 11.3769V11.4414H8.29448ZM9.02918 14.625C8.74601 14.625 8.50303 14.53 8.30022 14.34C8.09742 14.15 7.99601 13.9223 7.99601 13.657C7.99601 13.3917 8.09742 13.1641 8.30022 12.9741C8.50303 12.7841 8.74601 12.6891 9.02918 12.6891C9.31234 12.6891 9.55533 12.7841 9.75813 12.9741C9.96094 13.1641 10.0623 13.3917 10.0623 13.657C10.0623 13.8327 10.0145 13.994 9.91885 14.141C9.82701 14.288 9.70265 14.4063 9.54576 14.4959C9.3927 14.582 9.2205 14.625 9.02918 14.625Z"
                fill="#7A87AD"
              />
            </svg>
          </div>
          <div className="viewer_icon_group"></div>
        </div>
        <div className="circular_viewer_main">
          <div className="circular_container">
            <div className="side_bar" ref={sideBar}>
              <div className="side_bar_btn_group">
                <div className="side_btn" onClick={toggleSideBar}>
                  <svg
                    ref={expandBtn}
                    width={20}
                    height={16}
                    viewBox="0 0 20 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.54401 5.53165C4.83763 5.23949 4.83881 4.76462 4.54665 4.47099C4.25449 4.17737 3.77962 4.17619 3.48599 4.46835L4.54401 5.53165ZM0.470994 7.46835C0.177372 7.76051 0.176188 8.23538 0.468349 8.52901C0.760511 8.82263 1.23538 8.82381 1.52901 8.53165L0.470994 7.46835ZM1.52901 7.46835C1.23538 7.17619 0.760511 7.17737 0.468349 7.47099C0.176188 7.76462 0.177372 8.23949 0.470994 8.53165L1.52901 7.46835ZM3.48599 11.5317C3.77962 11.8238 4.25449 11.8226 4.54665 11.529C4.83881 11.2354 4.83763 10.7605 4.54401 10.4683L3.48599 11.5317ZM1 7.25C0.585787 7.25 0.25 7.58579 0.25 8C0.25 8.41421 0.585787 8.75 1 8.75V7.25ZM15 8.75C15.4142 8.75 15.75 8.41421 15.75 8C15.75 7.58579 15.4142 7.25 15 7.25V8.75ZM3.48599 4.46835L0.470994 7.46835L1.52901 8.53165L4.54401 5.53165L3.48599 4.46835ZM0.470994 8.53165L3.48599 11.5317L4.54401 10.4683L1.52901 7.46835L0.470994 8.53165ZM1 8.75L15 8.75V7.25L1 7.25V8.75Z"
                      fill="black"
                    />
                    <path
                      d="M7 11C7 13.2091 8.79086 15 11 15H15C17.2091 15 19 13.2091 19 11V5C19 2.79086 17.2091 1 15 1H11C8.79086 1 7 2.79086 7 5"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="side_btn">
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.0221 7.97776L8.02269 7.97776V12.9776C8.0349 13.5276 7.59494 13.9875 7.04501 13.9998C6.49508 14.012 6.03514 13.572 6.02293 13.022L6.02293 8.02217H1.02233C0.472393 8.03438 0.0124582 7.59438 0.000248134 7.0444C-0.0119619 6.49442 0.427993 6.03445 0.977925 6.02224H5.97853V1.02241C5.96632 0.472434 6.40628 0.0124593 6.95621 0.000248156C7.50614 -0.0119629 7.96608 0.42803 7.97829 0.97801V5.97783H12.9777C13.5276 5.96562 13.9875 6.40561 13.9998 6.9556C14.012 7.50558 13.572 7.96555 13.0221 7.97776Z"
                      fill="#017EFC"
                    />
                  </svg>
                </div>
              </div>
              <div
                className="day_lable"
                ref={(el) => (dayLables.current[0] = el)}
              >
                Yesterday
              </div>

              {Array.from({ length: 4 }).map((_, index) => (
                <div className="item_heading">
                  <div className="scrollable_text">
                    List of all my overdues arr
                  </div>
                  <Dropdown
                    rootClassName="taskboard_main_header_dropdown"
                    menu={{
                      items,
                    }}
                    trigger={["click"]}
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <Space>
                        <svg
                          className="info_icon"
                          xmlns="http://www.w3.org/2000/svg"
                          width={25}
                          height={25}
                          viewBox="0 0 30 30"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.8551 9.28591C13.6716 9.28591 12.7121 8.32648 12.7121 7.14296C12.7121 5.95943 13.6716 5 14.8551 5C16.0386 5 16.998 5.95943 16.998 7.14296C16.998 7.71131 16.7723 8.25637 16.3704 8.65825C15.9685 9.06014 15.4234 9.28591 14.8551 9.28591Z"
                            fill="#9F9F9F"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.8551 17.1417C13.6716 17.1417 12.7121 16.1823 12.7121 14.9987C12.7121 13.8152 13.6716 12.8558 14.8551 12.8558C16.0386 12.8558 16.998 13.8152 16.998 14.9987C16.998 16.1823 16.0386 17.1417 14.8551 17.1417Z"
                            fill="#9F9F9F"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.8551 25C13.6716 25 12.7121 24.0406 12.7121 22.857C12.7121 21.6735 13.6716 20.7141 14.8551 20.7141C16.0386 20.7141 16.998 21.6735 16.998 22.857C16.998 24.0406 16.0386 25 14.8551 25Z"
                            fill="#9F9F9F"
                          />
                        </svg>
                      </Space>
                    </a>
                  </Dropdown>
                </div>
              ))}

              <div
                className="day_lable"
                ref={(el) => (dayLables.current[1] = el)}
              >
                2 days ago
              </div>
              {Array.from({ length: 2 }).map((_, index) => (
                <div className="item_heading">
                  <div className="scrollable_text">
                    List of all my overdues arr
                  </div>
                  <Dropdown
                    rootClassName="taskboard_main_header_dropdown"
                    menu={{
                      items,
                    }}
                    trigger={["click"]}
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <Space>
                        <svg
                          className="info_icon"
                          xmlns="http://www.w3.org/2000/svg"
                          width={25}
                          height={25}
                          viewBox="0 0 30 30"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.8551 9.28591C13.6716 9.28591 12.7121 8.32648 12.7121 7.14296C12.7121 5.95943 13.6716 5 14.8551 5C16.0386 5 16.998 5.95943 16.998 7.14296C16.998 7.71131 16.7723 8.25637 16.3704 8.65825C15.9685 9.06014 15.4234 9.28591 14.8551 9.28591Z"
                            fill="#9F9F9F"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.8551 17.1417C13.6716 17.1417 12.7121 16.1823 12.7121 14.9987C12.7121 13.8152 13.6716 12.8558 14.8551 12.8558C16.0386 12.8558 16.998 13.8152 16.998 14.9987C16.998 16.1823 16.0386 17.1417 14.8551 17.1417Z"
                            fill="#9F9F9F"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.8551 25C13.6716 25 12.7121 24.0406 12.7121 22.857C12.7121 21.6735 13.6716 20.7141 14.8551 20.7141C16.0386 20.7141 16.998 21.6735 16.998 22.857C16.998 24.0406 16.0386 25 14.8551 25Z"
                            fill="#9F9F9F"
                          />
                        </svg>
                      </Space>
                    </a>
                  </Dropdown>
                </div>
              ))}
            </div>
            <div
              className="circular_view_container copilot_chat_container"
              // ref={containerRef}
            >
              <div className="chat_box" ref={chatBox}>
                <div
                  className="scroll_bottom_div"
                  ref={scrollBtm}
                  onClick={scrollToBottom}
                >
                  <svg
                    width={20}
                    height={20}
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2.72202 11.0637C3.05846 10.743 3.59095 10.756 3.91137 11.0928L10.1564 17.6567L10.1564 2.24196C10.1564 1.77688 10.533 1.39986 10.9976 1.39986C11.4622 1.39986 11.8389 1.77688 11.8389 2.24196L11.8389 17.6497L18.0772 11.0928C18.3976 10.756 18.9301 10.743 19.2665 11.0637C19.603 11.3845 19.616 11.9175 19.2955 12.2543L11.6449 20.2956C11.4906 20.4815 11.2579 20.5999 10.9976 20.5999L10.9943 20.5999C10.7719 20.6 10.5499 20.5124 10.3844 20.3385L2.69301 12.2543C2.37259 11.9175 2.38557 11.3845 2.72202 11.0637Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="day_lable">Yesterday</div>
                {chatData.map((chat, i) => {
                  return (
                    <div className="bubble_container" key={i}>
                      {chat.chatType === "left_message" ? (
                        <Image className="ai_pic" src={aiProfile} width={40} />
                      ) : (
                        <div className="invisible_div"></div>
                      )}
                      <div
                        className={`chat_bubble user_bubble ${chat.chatType} `}
                        dangerouslySetInnerHTML={{ __html: chat.message }}
                      ></div>
                      {chat.chatType === "right_message" ? (
                        <Image
                          className="ai_pic"
                          src={ProfileIcons}
                          width={40}
                        />
                      ) : (
                        <div className="invisible_div_profile"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="ai_input_container" ref={inputContainer}>
                <input
                  type="text"
                  placeholder="Type a prompt, query, etc."
                  ref={inputArea}
                  onKeyDown={(e) =>
                    e.key === "Enter" ? handleUserInput() : null
                  }
                />
                <div className="input_btn_group">
                  <div onClick={() => {}}>
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="0.5"
                        y="0.5"
                        width="29"
                        height="29"
                        rx="14.5"
                        stroke="black"
                        strokeDasharray="4 4"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.6311 7.58667L22.0402 14.2805C22.2315 14.3927 22.3489 14.5979 22.3489 14.8196C22.3489 14.8496 22.3468 14.8793 22.3426 14.9085C22.3135 15.1177 22.1809 15.2938 21.9982 15.3833L10.6311 22.0532C10.1376 22.3487 9.51784 22.3339 9.03894 22.0147C8.5589 21.6948 8.30658 21.1266 8.39114 20.556C8.39726 20.5147 8.40748 20.4742 8.42166 20.435L10.4529 14.8196L8.42167 9.20495C8.40748 9.16574 8.39726 9.1252 8.39114 9.08395C8.30658 8.51331 8.5589 7.9451 9.03894 7.62519C9.51784 7.30604 10.1376 7.29117 10.6311 7.58667ZM11.5554 15.4467L9.62517 20.7826C9.62777 20.8592 9.66693 20.9311 9.73215 20.9745C9.80959 21.0262 9.90987 21.0284 9.98958 20.9804L9.9958 20.9767L19.4202 15.4467H11.5554ZM19.4272 14.1967L9.98956 8.65953C9.90985 8.6115 9.80959 8.61375 9.73215 8.66536C9.66694 8.70882 9.62777 8.78068 9.62517 8.85727L11.5569 14.1967H19.4272Z"
                        fill="black"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
