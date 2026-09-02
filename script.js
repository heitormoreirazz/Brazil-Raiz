
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const toast = document.querySelector(".toast");
const form = document.querySelector("#signup-form");
const modal = document.querySelector("#detail-modal");
const modalTitle = document.querySelector("#modal-title");
let toastTimer;

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3500);
}

menuToggle?.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Abrir menu");
    });
});

document.querySelectorAll(".js-whatsapp").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showToast("Insira o número oficial do WhatsApp na próxima etapa.");
    });
});

document.querySelectorAll("[data-event]").forEach((link) => {
    link.addEventListener("click", () => {
        const eventSelect = document.querySelector("#event");
        const eventName = link.dataset.event;
        const option = [...eventSelect.options].find((item) => item.textContent.startsWith(eventName));
        if (option) eventSelect.value = option.value;
    });
});

function setFieldError(fieldId, message) {
    const field = document.querySelector(`#${fieldId}`);
    const error = document.querySelector(`#${fieldId}-error`);
    const wrapper = field?.closest(".field");
    if (!field || !error) return;
    error.textContent = message;
    wrapper?.classList.toggle("invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
}

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements.name;
    const email = form.elements.email;
    const phone = form.elements.phone;
    const eventSelect = form.elements.event;
    const consent = form.elements.consent;
    const feedback = document.querySelector("#form-feedback");
    let valid = true;

    setFieldError("name", "");
    setFieldError("email", "");
    setFieldError("phone", "");
    setFieldError("event", "");
    document.querySelector("#consent-error").textContent = "";
    feedback.textContent = "";

    if (name.value.trim().length < 3) {
        setFieldError("name", "Informe seu nome completo.");
        valid = false;
    }
    if (!email.validity.valid) {
        setFieldError("email", "Informe um e-mail válido.");
        valid = false;
    }
    if (phone.value.replace(/\D/g, "").length < 10) {
        setFieldError("phone", "Informe um telefone válido.");
        valid = false;
    }
    if (!eventSelect.value) {
        setFieldError("event", "Selecione um evento.");
        valid = false;
    }
    if (!consent.checked) {
        document.querySelector("#consent-error").textContent = "É necessário autorizar o recebimento de novidades.";
        valid = false;
    }

    if (!valid) {
        form.querySelector("[aria-invalid='true'], input:not(:checked)")?.focus();
        return;
    }

    feedback.textContent = "Cadastro demonstrativo realizado. Obrigado por fazer parte!";
    form.reset();
});

function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
}

document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
        modalTitle.textContent = item.dataset.title;
        modal.hidden = false;
        document.body.classList.add("modal-open");
        document.querySelector(".modal-close").focus();
    });
});

document.querySelector(".modal-close")?.addEventListener("click", closeModal);
modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
});

const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 })
    : null;

document.querySelectorAll(".reveal").forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("visible");
});
