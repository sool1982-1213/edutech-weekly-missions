document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const teacherInput = document.getElementById('teacherInput');
  const academyInput = document.getElementById('academyInput');
  const subjectInput = document.getElementById('subjectInput');
  const targetClassInput = document.getElementById('targetClassInput');
  const noticeTitleInput = document.getElementById('noticeTitleInput');
  const dateTimeInput = document.getElementById('dateTimeInput');
  const contentInput = document.getElementById('contentInput');
  const materialsInput = document.getElementById('materialsInput');
  const requestInput = document.getElementById('requestInput');

  // Outputs
  const standardText = document.getElementById('standardText');
  const kakaoText = document.getElementById('kakaoText');
  const friendlyText = document.getElementById('friendlyText');

  // Card Outputs
  const cardAcademy = document.getElementById('cardAcademy');
  const cardTarget = document.getElementById('cardTarget');
  const cardTitle = document.getElementById('cardTitle');
  const cardDate = document.getElementById('cardDate');
  const cardContent = document.getElementById('cardContent');
  const cardMaterials = document.getElementById('cardMaterials');
  const cardRequest = document.getElementById('cardRequest');
  const cardTeacher = document.getElementById('cardTeacher');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const toast = document.getElementById('toast');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  function updateNotices() {
    const teacher = teacherInput.value.trim() || '[선생님 이름]';
    const academy = academyInput.value.trim() || '[학원명]';
    const subject = subjectInput.value.trim() || '[과목]';
    const targetClass = targetClassInput.value.trim() || '[대상 반]';
    const title = noticeTitleInput.value.trim() || '[공지 제목]';
    const dateTime = dateTimeInput.value.trim() || '[일시]';
    const content = contentInput.value.trim() || '[핵심 내용]';
    const materials = materialsInput.value.trim() || '[준비물]';
    const request = requestInput.value.trim() || '[요청 사항]';

    // 1. Standard Type
    const standard = `[${academy} ${title}]

학부모님, 안녕하십니까.
${academy} ${subject} 담당 ${teacher} 선생님입니다.

학생들의 성실한 학습과 원활한 수업 진행을 위해 아래와 같이 안내드립니다.

1. 대상: ${targetClass}
2. 일시: ${dateTime}
3. 주요 수업 및 활동 내용:
   - ${content}
4. 지참 준비물:
   - ${materials}
5. 학부모님 협조 요청 사항:
   - ${request}

항상 학생들의 성장을 함께 응원해 주시는 학부모님의 노고에 깊이 감사드리며, 알차고 유익한 시간이 될 수 있도록 꼼꼼히 지도하겠습니다.

감사합니다.

- 담당 교사: ${teacher} 드림 -
- ${academy} -`;

    // 2. Kakao Type
    const kakao = `📢 [${academy}] ${title}

학부모님 안녕하세요, ${teacher}입니다!
수업 일정을 간략히 요약하여 공유드립니다.

■ 대상: ${targetClass}
■ 일시: ${dateTime}
■ 내용: ${content}
■ 준비물: ${materials}
■ 안내사항: ${request}

※ 수업 관련 궁금하신 점은 언제든 편하게 메시지 남겨주세요!`;

    // 3. Friendly Type
    const friendly = `학부모님 안녕하세요! ${academy} ${teacher} 선생님이에요 😊

계절의 변화 속에서도 우리 ${targetClass} 친구들이 열심히 수학의 기초를 다져가고 있어 대견한 마음입니다.

이번에 진행되는 "${title}" 소식을 전해드려요!

🗓️ 언제 만나나요?
${dateTime}

💡 어떤 활동을 하나요?
${content}

🎒 무엇을 챙겨올까요?
${materials}

💖 가정에서 도와주실 점:
${request}

아이들이 수학을 재미있고 자신감 있게 공부할 수 있도록 이번 시간도 따뜻하고 꼼꼼하게 살피겠습니다. 가정에서도 큰 응원 부탁드립니다! 감사합니다 🌿`;

    standardText.textContent = standard;
    kakaoText.textContent = kakao;
    friendlyText.textContent = friendly;

    // Update Mobile Card
    cardAcademy.textContent = academy;
    cardTarget.textContent = targetClass;
    cardTitle.textContent = title;
    cardDate.textContent = dateTime;
    cardContent.textContent = content;
    cardMaterials.textContent = materials;
    cardRequest.textContent = request;
    cardTeacher.textContent = teacher;
  }

  // Copy buttons
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId).textContent;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('공지문이 복사되었습니다!');
      }).catch(() => {
        prompt('아래 문구를 복사하세요:', textToCopy);
      });
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Event listeners
  [
    teacherInput, academyInput, subjectInput, targetClassInput,
    noticeTitleInput, dateTimeInput, contentInput, materialsInput, requestInput
  ].forEach(input => {
    input.addEventListener('input', updateNotices);
  });

  updateNotices();
});
