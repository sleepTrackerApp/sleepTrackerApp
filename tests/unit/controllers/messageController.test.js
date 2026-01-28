const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Message Controller - postChatMessage', () => {
  const mockUserId = '507f1f77bcf86cd799439011';

  let saveUserMessageStub;
  let sendReplyStub;
  let getReplyStub;
  let messageController;
  let req;
  let res;

  beforeEach(() => {
    saveUserMessageStub = sinon.stub();
    sendReplyStub = sinon.stub();
    getReplyStub = sinon.stub();

    // Wire controller with stubbed dependencies
    messageController = proxyquire('../../../src/controllers/messageController', {
      '../services/messageService': {
        saveUserMessage: saveUserMessageStub,
        sendReply: sendReplyStub,
      },
      '../helpers/chatBot': {
        getReply: getReplyStub,
      },
    });

    req = {
      body: {},
    };

    res = {
      locals: {
        userRecord: { _id: mockUserId },
      },
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('saves user message, gets bot reply, and returns both', async () => {
    const content = 'Hello bot!';
    req.body.content = content;

    const savedMessage = {
      _id: 'msg123',
      userId: mockUserId,
      content,
      createdAt: new Date('2026-01-01T10:00:00Z'),
    };
    const replyText = 'Hi there!';
    const savedReply = {
      _id: 'rep456',
      userId: mockUserId,
      content: replyText,
      createdAt: new Date('2026-01-01T10:00:10Z'),
    };

    saveUserMessageStub.resolves(savedMessage);
    getReplyStub.resolves(replyText);
    sendReplyStub.resolves(savedReply);

    await messageController.postChatMessage(req, res);

    expect(saveUserMessageStub.calledOnceWithExactly(mockUserId, content)).to.be
      .true;
    expect(getReplyStub.calledOnceWithExactly(content, mockUserId)).to.be.true;
    expect(sendReplyStub.calledOnceWithExactly(mockUserId, replyText)).to.be
      .true;

    expect(res.status.calledOnceWithExactly(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    const payload = res.json.firstCall.args[0];
    expect(payload.success).to.be.true;
    expect(payload.message).to.deep.equal(savedMessage);
    expect(payload.reply).to.deep.equal(savedReply);
  });

  it('returns 400 when content is empty and does not call services', async () => {
    req.body.content = '   ';

    await messageController.postChatMessage(req, res);

    expect(res.status.calledOnceWithExactly(400)).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    const payload = res.json.firstCall.args[0];
    expect(payload).to.deep.equal({ error: 'content is required' });

    expect(saveUserMessageStub.called).to.be.false;
    expect(getReplyStub.called).to.be.false;
    expect(sendReplyStub.called).to.be.false;
  });
});

