import unittest
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import Mock, patch

from packages.chat import provider, service
from packages.chat.models import ChatDocument, Citation, Conversation, Message


class ChatServiceTests(unittest.TestCase):
    def test_chunk_text_splits_large_documents_with_overlap(self) -> None:
        chunks = service._chunk_text("a" * 7000)

        self.assertEqual(len(chunks), 3)
        self.assertTrue(all(len(chunk) <= 3000 for chunk in chunks))

    def test_answer_is_grounded_and_persisted_with_citations(self) -> None:
        now = datetime.now(UTC)
        conversation = Conversation("conversation", "user", "Docs", now, now)
        document = ChatDocument(
            "document",
            conversation.id,
            "guide.pdf",
            "application/pdf",
            "key",
            "READY",
            None,
            now,
            now,
        )
        citation = Citation("document", "guide.pdf", 2, "The answer is 42.")
        saved = Message("assistant", conversation.id, "assistant", "It is 42.", [], now)

        with (
            patch.object(service, "get_conversation", return_value=(conversation, [document], [])),
            patch.object(service.repository, "retrieve_chunks", return_value=[citation]),
            patch.object(service.repository, "create_message", side_effect=[Mock(), saved]) as create_message,
            patch.object(provider, "complete", return_value="It is 42.") as complete,
        ):
            result = service.answer_question(conversation.id, "user", "What is it?")

        self.assertIs(result, saved)
        prompt = complete.call_args.args[0][-1]["content"]
        self.assertIn("guide.pdf", prompt)
        self.assertIn("The answer is 42.", prompt)
        self.assertEqual(create_message.call_args_list[-1].args[4][0]["document_id"], "document")

    def test_stream_emits_citations_tokens_and_done(self) -> None:
        citation = Citation("document", "guide.pdf", 0, "Grounded text")
        saved = SimpleNamespace(id="message", created_at=datetime.now(UTC))
        with (
            patch.object(service, "_prepare_question", return_value=([{"role": "user", "content": "q"}], [citation])),
            patch.object(provider, "stream", return_value=iter(["Hello", " world"])),
            patch.object(service, "_save_answer", return_value=saved) as save,
        ):
            events = list(service.stream_answer("conversation", "user", "q"))

        self.assertTrue(events[0].startswith("event: citations"))
        self.assertIn('"content": "Hello"', events[1])
        self.assertTrue(events[-1].startswith("event: done"))
        save.assert_called_once_with("conversation", "Hello world", [citation])


class ChatProviderTests(unittest.TestCase):
    def test_response_text_accepts_openrouter_text(self) -> None:
        self.assertEqual(
            provider._response_text({"choices": [{"message": {"content": " answer "}}]}),
            "answer",
        )


if __name__ == "__main__":
    unittest.main()
